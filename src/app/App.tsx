// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { AthleteDashboard } from "./components/athlete/AthleteDashboard";
import { ProgramMarketplace } from "./components/athlete/ProgramMarketplace";
import { Messaging } from "./components/athlete/Messaging";
import { AthleteProfile } from "./components/athlete/AthleteProfile";
import { AthleteJournal, type JournalEntry, type JournalMedia } from "./components/athlete/AthleteJournal";
import { CoachView } from "./components/coach/CoachView";
import { AdminView } from "./components/admin/AdminView";
import { LoginPage } from "./components/auth/LoginPage";
import { supabase } from "../lib/supabase";
import type { AthleteRecord, Profile, Role } from "../lib/database.types";
import {
  createAthleteProfile,
  createCoachAccount,
  createJournalEntry,
  deleteJournalEntry,
  ensureProfileFromUser,
  fetchProfile,
  listAthletes,
  listCoaches,
  listJournalEntries,
  loginWithPassword,
  logout,
  mapJournalRow,
  signUpAthlete,
  updateJournalEntry,
  uploadJournalMediaFiles,
  type AuthResult,
} from "../lib/api";

interface CreateJournalResult {
  success: boolean;
  message: string;
}

const defaultPage: Record<Role, string> = {
  athlete: "dashboard",
  coach: "coach-dashboard",
  admin: "admin-dashboard",
};

export default function App() {
  const [athletes, setAthletes] = useState<AthleteRecord[]>([]);
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [activeUser, setActiveUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role>("athlete");
  const [page, setPage] = useState<string>("dashboard");
  const [bootstrapping, setBootstrapping] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refreshDirectory = useCallback(async (forEmail?: string) => {
    const [athleteRows, coachRows, journalRows] = await Promise.all([
      listAthletes(),
      listCoaches(),
      listJournalEntries(forEmail),
    ]);
    setAthletes(athleteRows);
    setCoaches(coachRows);
    setJournalEntries(journalRows.map(mapJournalRow));
  }, []);

  const activateProfile = useCallback(
    async (profile: Profile, options?: { resetPage?: boolean }) => {
      setActiveUser(profile);
      setRole(profile.role);
      setSessionError(null);
      if (options?.resetPage) {
        setPage(defaultPage[profile.role]);
      }
      await refreshDirectory(profile.role === "athlete" ? profile.email : undefined);
    },
    [refreshDirectory]
  );

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        let profile = await fetchProfile(data.session.user.id);
        if (!profile) {
          profile = await ensureProfileFromUser(data.session.user);
        }
        if (profile && mounted) {
          await activateProfile(profile, { resetPage: true });
        } else if (mounted) {
          await logout();
          setSessionError("Your account is missing a profile. Sign in again or contact an admin.");
        }
      }
      if (mounted) setBootstrapping(false);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        setActiveUser(null);
        setAthletes([]);
        setCoaches([]);
        setJournalEntries([]);
        setRole("athlete");
        setPage(defaultPage.athlete);
        return;
      }

      if (event === "SIGNED_IN") {
        let profile = await fetchProfile(session.user.id);
        if (!profile) profile = await ensureProfileFromUser(session.user);
        if (profile && mounted) {
          await activateProfile(profile, { resetPage: true });
        }
      }

      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        const profile = await fetchProfile(session.user.id);
        if (profile && mounted) {
          await activateProfile(profile, { resetPage: false });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [activateProfile]);

  const handleLogin = async (payload: { email: string; password: string }): Promise<AuthResult> => {
    setSessionError(null);
    const result = await loginWithPassword(payload);
    if (result.success && result.profile) {
      await activateProfile(result.profile, { resetPage: true });
    }
    return result;
  };

  const handleAthleteSignUp = async (payload: {
    name: string;
    email: string;
    password: string;
    sport: string;
  }): Promise<AuthResult> => {
    setSessionError(null);
    const result = await signUpAthlete(payload);
    if (result.success && result.profile) {
      await activateProfile(result.profile, { resetPage: true });
    }
    return result;
  };

  const handleLogout = async () => {
    await logout();
    setActiveUser(null);
    setRole("athlete");
    setPage(defaultPage.athlete);
  };

  const handleCoachCreation = async (payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResult> => {
    const result = await createCoachAccount(payload);
    if (result.success) await refreshDirectory();
    return result;
  };

  const handleAthleteProfileCreation = async (payload: {
    name: string;
    email: string;
    sport: string;
  }): Promise<AuthResult> => {
    const result = await createAthleteProfile(payload);
    if (result.success) await refreshDirectory();
    return result;
  };

  const handleCreateJournalEntry = async (payload: {
    athleteEmail: string;
    athleteName: string;
    text: string;
    mediaFiles: Array<{ file: File; type: JournalMedia["type"] }>;
  }): Promise<CreateJournalResult> => {
    if (!activeUser) return { success: false, message: "Not signed in." };

    const hasText = Boolean(payload.text.trim());
    const hasMedia = payload.mediaFiles.length > 0;
    if (!hasText && !hasMedia) {
      return { success: false, message: "Entry needs text or media." };
    }

    let media: JournalMedia[] = [];
    if (hasMedia) {
      const upload = await uploadJournalMediaFiles(activeUser.id, payload.mediaFiles);
      if (!upload.success) return { success: false, message: upload.message };
      media = upload.media;
    }

    const result = await createJournalEntry({
      athleteEmail: payload.athleteEmail,
      athleteName: payload.athleteName,
      text: payload.text,
      media,
    });
    if (result.success) await refreshDirectory(activeUser.email);
    return { success: result.success, message: result.message };
  };

  const handleUpdateJournalEntry = async (payload: {
    id: string;
    text: string;
  }): Promise<CreateJournalResult> => {
    const entry = journalEntries.find((item) => item.id === payload.id);
    const hasMedia = Boolean(entry?.media?.length);
    if (!payload.text.trim() && !hasMedia) {
      return { success: false, message: "Journal text cannot be empty unless the entry has media." };
    }
    const result = await updateJournalEntry({ id: payload.id, text: payload.text });
    if (result.success && activeUser) await refreshDirectory(activeUser.email);
    return result;
  };

  const handleDeleteJournalEntry = async (payload: {
    id: string;
  }): Promise<CreateJournalResult> => {
    const result = await deleteJournalEntry(payload);
    if (result.success && activeUser) await refreshDirectory(activeUser.email);
    return result;
  };

  const renderContent = () => {
    if (role === "athlete") {
      if (!activeUser) return null;
      if (page === "dashboard") return <AthleteDashboard athleteName={activeUser.name} />;
      if (page === "programs") return <ProgramMarketplace onGoToDashboard={() => setPage("dashboard")} />;
      if (page === "messages") return <Messaging />;
      if (page === "journal") {
        return (
          <AthleteJournal
            athleteEmail={activeUser.email}
            athleteName={activeUser.name}
            entries={journalEntries.filter(
              (entry) => entry.athleteEmail.toLowerCase() === activeUser.email.toLowerCase()
            )}
            onCreateEntry={handleCreateJournalEntry}
            onUpdateEntry={handleUpdateJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        );
      }
      if (page === "profile") {
        return (
          <AthleteProfile
            user={activeUser}
            onProfileUpdated={(profile) => {
              setActiveUser(profile);
            }}
          />
        );
      }
    }
    if (role === "coach") {
      return <CoachView currentPage={page} onNavigate={setPage} />;
    }
    if (role === "admin") {
      return (
        <AdminView
          currentPage={page}
          onCreateCoach={handleCoachCreation}
          onCreateAthleteProfile={handleAthleteProfileCreation}
          athletes={athletes.map((athlete) => ({
            id: athlete.id,
            name: athlete.name,
            email: athlete.email,
            sport: athlete.sport,
            createdBy: athlete.created_by,
          }))}
          coaches={coaches.map((coach) => ({
            id: coach.id,
            name: coach.name,
            email: coach.email,
          }))}
          journalEntries={journalEntries}
        />
      );
    }
    return null;
  };

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div>
        {sessionError && (
          <div className="bg-destructive/10 text-destructive text-center px-4 py-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
            {sessionError}
          </div>
        )}
        <LoginPage onLogin={handleLogin} onAthleteSignUp={handleAthleteSignUp} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar
        role={role}
        currentPage={page}
        onNavigate={setPage}
        onLogout={handleLogout}
        currentUserName={activeUser.name}
      />
      <main className="flex-1 flex flex-col overflow-hidden">{renderContent()}</main>
    </div>
  );
}
