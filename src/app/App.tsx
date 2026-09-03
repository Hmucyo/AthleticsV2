// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { AthleteDashboard } from "./components/athlete/AthleteDashboard";
import { ProgramMarketplace } from "./components/athlete/ProgramMarketplace";
import { Messaging } from "./components/athlete/Messaging";
import { AthleteProfile } from "./components/athlete/AthleteProfile";
import { AthleteNotifications } from "./components/athlete/AthleteNotifications";
import { WorkoutReminderToast } from "./components/athlete/WorkoutReminderToast";
import { AthleteJournal, type JournalEntry, type JournalMedia } from "./components/athlete/AthleteJournal";
import { useWorkoutReminders } from "./hooks/useWorkoutReminders";
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
import {
  loadTrainingState,
  saveTrainingState,
  type AthleteExerciseAssignment,
  type ExerciseItem,
  type ProgramItem,
} from "../lib/training";
import {
  ensureProgramGroups,
  loadMessagingState,
  saveMessagingState,
  syncSharedGroupMembers,
  type Conversation,
  type MessagingUser,
} from "../lib/messaging";

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
  const [exerciseList, setExerciseList] = useState<ExerciseItem[]>(() => loadTrainingState().exercises);
  const [programList, setProgramList] = useState<ProgramItem[]>(() => loadTrainingState().programs);
  const [assignments, setAssignments] = useState<AthleteExerciseAssignment[]>(() => loadTrainingState().assignments);
  const [conversations, setConversations] = useState<Conversation[]>(() => loadMessagingState().conversations);
  const athleteEmail = role === "athlete" && activeUser ? activeUser.email : null;
  const {
    notifications,
    unreadCount: notificationUnreadCount,
    toast: workoutToast,
    dismissToast,
    markAllRead,
  } = useWorkoutReminders(athleteEmail, assignments);

  const commitConversations = useCallback(
    (updater: Conversation[] | ((previous: Conversation[]) => Conversation[])) => {
      setConversations((previous) => {
        const next = typeof updater === "function" ? updater(previous) : updater;
        saveMessagingState({ conversations: next });
        return next;
      });
    },
    []
  );

  useEffect(() => {
    saveTrainingState({ exercises: exerciseList, programs: programList, assignments });
  }, [exerciseList, programList, assignments]);

  useEffect(() => {
    if (page === "notifications") dismissToast();
  }, [page, dismissToast]);

  // Keep tabs/windows in sync when another session writes messaging state.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "afsp-messaging-v1" || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as { conversations?: Conversation[] };
        if (Array.isArray(parsed.conversations)) {
          setConversations(parsed.conversations);
        }
      } catch {
        // ignore malformed storage payloads
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Reload shared threads whenever the signed-in account changes.
  useEffect(() => {
    if (!activeUser) return;
    setConversations(loadMessagingState().conversations);
  }, [activeUser?.id]);

  const messagingDirectory = useMemo<MessagingUser[]>(() => {
    const users: MessagingUser[] = [
      ...coaches.map((coach) => ({
        id: coach.id,
        name: coach.name,
        email: coach.email,
        role: "coach" as const,
      })),
      ...athletes.map((athlete) => ({
        id: athlete.id,
        name: athlete.name,
        email: athlete.email,
        role: "athlete" as const,
      })),
    ];
    if (activeUser?.role === "admin") {
      users.unshift({
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        role: "admin",
      });
    } else if (activeUser) {
      users.push({
        id: "admin-platform",
        name: "Platform Admin",
        email: "admin@afsp.com",
        role: "admin",
      });
      if (!users.some((user) => user.email.toLowerCase() === activeUser.email.toLowerCase())) {
        users.push({
          id: activeUser.id,
          name: activeUser.name,
          email: activeUser.email,
          role: activeUser.role,
        });
      }
    }
    const byEmail = new Map<string, MessagingUser>();
    users.forEach((user) => byEmail.set(user.email.toLowerCase(), user));
    return [...byEmail.values()];
  }, [activeUser, athletes, coaches]);

  useEffect(() => {
    const memberEmails = Array.from(
      new Set([
        "admin@afsp.com",
        "marcus@afsp.com",
        "jordan@afsp.com",
        ...coaches.map((coach) => coach.email.toLowerCase()),
        ...athletes.map((athlete) => athlete.email.toLowerCase()),
        ...(activeUser ? [activeUser.email.toLowerCase()] : []),
      ])
    );
    commitConversations((previous) => {
      const withPrograms = ensureProgramGroups(previous, programList, memberEmails);
      const withMembers = syncSharedGroupMembers(withPrograms, memberEmails);
      return withMembers;
    });
  }, [activeUser, athletes, coaches, commitConversations, programList]);

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
      if (page === "dashboard") {
        return (
          <AthleteDashboard
            athleteName={activeUser.name}
            athleteEmail={activeUser.email}
            exercises={exerciseList}
            assignments={assignments.filter(
              (item) => item.athleteEmail.toLowerCase() === activeUser.email.toLowerCase()
            )}
            onToggleAssignmentComplete={(assignmentId) => {
              setAssignments((previous) =>
                previous.map((item) =>
                  item.id === assignmentId ? { ...item, completed: !item.completed } : item
                )
              );
            }}
            onUpdateAssignmentWeight={(assignmentId, loggedWeight, weightUnit) => {
              setAssignments((previous) =>
                previous.map((item) =>
                  item.id === assignmentId
                    ? {
                        ...item,
                        loggedWeight: loggedWeight.trim() ? loggedWeight.trim() : undefined,
                        weightUnit,
                      }
                    : item
                )
              );
            }}
          />
        );
      }
      if (page === "programs") {
        return (
          <ProgramMarketplace
            onGoToDashboard={() => setPage("dashboard")}
            programs={programList}
            exercises={exerciseList}
          />
        );
      }
      if (page === "messages") {
        return (
          <Messaging
            currentUser={{
              id: activeUser.id,
              name: activeUser.name,
              email: activeUser.email,
              role: "athlete",
            }}
            conversations={conversations}
            onConversationsChange={commitConversations}
            directory={messagingDirectory}
          />
        );
      }
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
      if (page === "notifications") {
        return (
          <AthleteNotifications
            notifications={notifications}
            onMarkAllRead={markAllRead}
            onOpenTraining={() => setPage("dashboard")}
          />
        );
      }
    }
    if (role === "coach") {
      if (!activeUser) return null;
      return (
        <CoachView
          currentPage={page}
          onNavigate={setPage}
          currentUser={{
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            role: "coach",
          }}
          conversations={conversations}
          onConversationsChange={commitConversations}
          messagingDirectory={messagingDirectory}
        />
      );
    }
    if (role === "admin") {
      if (!activeUser) return null;
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
          exerciseList={exerciseList}
          programList={programList}
          assignments={assignments}
          onExercisesChange={setExerciseList}
          onProgramsChange={setProgramList}
          onAssignmentsChange={setAssignments}
          currentUser={{
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            role: "admin",
          }}
          conversations={conversations}
          onConversationsChange={commitConversations}
          messagingDirectory={messagingDirectory}
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
    <div className="flex flex-col md:flex-row h-dvh w-full overflow-hidden bg-background">
      <Sidebar
        role={role}
        currentPage={page}
        onNavigate={setPage}
        onLogout={handleLogout}
        currentUserName={activeUser.name}
        notificationUnreadCount={role === "athlete" ? notificationUnreadCount : 0}
      />
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">{renderContent()}</main>
      {role === "athlete" && workoutToast && (
        <WorkoutReminderToast
          notification={workoutToast}
          onDismiss={dismissToast}
          onOpen={() => {
            dismissToast();
            setPage("notifications");
          }}
        />
      )}
    </div>
  );
}
