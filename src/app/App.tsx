// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { AthleteDashboard } from "./components/athlete/AthleteDashboard";
import { ProgramMarketplace } from "./components/athlete/ProgramMarketplace";
import { Messaging } from "./components/athlete/Messaging";
import { AthleteProfile } from "./components/athlete/AthleteProfile";
import { AthleteJournal, type JournalEntry, type JournalMedia } from "./components/athlete/AthleteJournal";
import { CoachView } from "./components/coach/CoachView";
import { AdminView } from "./components/admin/AdminView";
import { LoginPage } from "./components/auth/LoginPage";

type Role = 'athlete' | 'coach' | 'admin';

interface UserAccount {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
}

interface AthleteRecord {
  id: string;
  name: string;
  email: string;
  sport: string;
  createdBy: "admin" | "self";
}

interface AuthResult {
  success: boolean;
  message: string;
}

interface CreateJournalResult {
  success: boolean;
  message: string;
}

const defaultPage: Record<Role, string> = {
  athlete: 'dashboard',
  coach: 'coach-dashboard',
  admin: 'admin-dashboard',
};

const seedAccounts: UserAccount[] = [
  {
    id: "admin-001",
    role: "admin",
    name: "Platform Admin",
    email: "admin@afsp.com",
    password: "Admin123!",
  },
  {
    id: "coach-001",
    role: "coach",
    name: "Marcus Webb",
    email: "marcus@afsp.com",
    password: "Coach123!",
  },
  {
    id: "athlete-001",
    role: "athlete",
    name: "Jordan Cole",
    email: "jordan@afsp.com",
    password: "Athlete123!",
  },
];

const seedAthletes: AthleteRecord[] = [
  {
    id: "profile-001",
    name: "Jordan Cole",
    email: "jordan@afsp.com",
    sport: "Football",
    createdBy: "self",
  },
];

const seedJournalEntries: JournalEntry[] = [
  {
    id: "journal-001",
    athleteEmail: "jordan@afsp.com",
    athleteName: "Jordan Cole",
    text: "Felt explosive today. Sprint block starts were sharp and recovery felt solid.",
    createdAt: "Jun 11, 2026 · 7:42 PM",
    media: [],
  },
];

export default function App() {
  const [accounts, setAccounts] = useState<UserAccount[]>(seedAccounts);
  const [athletes, setAthletes] = useState<AthleteRecord[]>(seedAthletes);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(seedJournalEntries);
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);
  const [role, setRole] = useState<Role>('athlete');
  const [page, setPage] = useState<string>('dashboard');

  const handleLogin = (payload: { role: Role; email: string; password: string }): AuthResult => {
    const normalizedEmail = payload.email.toLowerCase();
    const matchedAccount = accounts.find(
      (account) =>
        account.role === payload.role &&
        account.email.toLowerCase() === normalizedEmail &&
        account.password === payload.password
    );

    if (!matchedAccount) {
      return {
        success: false,
        message: `Invalid ${payload.role} credentials. Please try again.`,
      };
    }

    setActiveUser(matchedAccount);
    setRole(matchedAccount.role);
    setPage(defaultPage[matchedAccount.role]);
    return {
      success: true,
      message: `Welcome back, ${matchedAccount.name}.`,
    };
  };

  const handleAthleteSignUp = (payload: { name: string; email: string; password: string; sport: string }): AuthResult => {
    const normalizedEmail = payload.email.toLowerCase();
    const emailInUse = accounts.some((account) => account.email.toLowerCase() === normalizedEmail);
    if (emailInUse) {
      return {
        success: false,
        message: "An account with that email already exists.",
      };
    }

    const createdAthlete: UserAccount = {
      id: `athlete-${Date.now()}`,
      role: "athlete",
      name: payload.name,
      email: normalizedEmail,
      password: payload.password,
    };

    setAccounts((previous) => [...previous, createdAthlete]);
    setAthletes((previous) => [
      ...previous,
      {
        id: `profile-${Date.now()}`,
        name: payload.name,
        email: normalizedEmail,
        sport: payload.sport,
        createdBy: "self",
      },
    ]);

    setActiveUser(createdAthlete);
    setRole("athlete");
    setPage(defaultPage.athlete);

    return {
      success: true,
      message: "Athlete account created. You are now signed in.",
    };
  };

  const handleLogout = () => {
    setActiveUser(null);
    setRole("athlete");
    setPage(defaultPage.athlete);
  };

  const handleCoachCreation = (payload: { name: string; email: string; password: string }): AuthResult => {
    const normalizedEmail = payload.email.toLowerCase();
    const emailInUse = accounts.some((account) => account.email.toLowerCase() === normalizedEmail);
    if (emailInUse) {
      return {
        success: false,
        message: "Email already exists. Coach login was not created.",
      };
    }

    const coachAccount: UserAccount = {
      id: `coach-${Date.now()}`,
      role: "coach",
      name: payload.name,
      email: normalizedEmail,
      password: payload.password,
    };

    setAccounts((previous) => [...previous, coachAccount]);
    return {
      success: true,
      message: `Coach login created for ${payload.name}.`,
    };
  };

  const handleAthleteProfileCreation = (payload: { name: string; email: string; sport: string }): AuthResult => {
    const normalizedEmail = payload.email.toLowerCase();
    const athleteAccount = accounts.find(
      (account) => account.role === "athlete" && account.email.toLowerCase() === normalizedEmail
    );
    if (!athleteAccount) {
      return {
        success: false,
        message: "Athlete account not found. Athlete must sign up first from login page.",
      };
    }

    const profileExists = athletes.some((athlete) => athlete.email.toLowerCase() === normalizedEmail);
    if (profileExists) {
      return {
        success: false,
        message: "Athlete profile already exists for that account.",
      };
    }

    setAthletes((previous) => [
      ...previous,
      {
        id: `profile-${Date.now()}`,
        name: payload.name,
        email: normalizedEmail,
        sport: payload.sport,
        createdBy: "admin",
      },
    ]);

    return {
      success: true,
      message: `Athlete profile created for ${payload.name}.`,
    };
  };

  const handleCreateJournalEntry = (payload: { athleteEmail: string; athleteName: string; text: string; media: JournalMedia[] }): CreateJournalResult => {
    const hasText = Boolean(payload.text.trim());
    const hasMedia = payload.media.length > 0;
    if (!hasText && !hasMedia) {
      return {
        success: false,
        message: "Entry needs text or media.",
      };
    }

    setJournalEntries((previous) => [
      {
        id: `journal-${Date.now()}`,
        athleteEmail: payload.athleteEmail.toLowerCase(),
        athleteName: payload.athleteName,
        text: payload.text,
        media: payload.media,
        createdAt: new Date().toLocaleString(),
      },
      ...previous,
    ]);

    return {
      success: true,
      message: "Journal entry saved.",
    };
  };

  const handleUpdateJournalEntry = (payload: { id: string; text: string }): CreateJournalResult => {
    const updatedText = payload.text.trim();
    if (!updatedText) {
      return {
        success: false,
        message: "Journal text cannot be empty.",
      };
    }

    setJournalEntries((previous) =>
      previous.map((entry) =>
        entry.id === payload.id
          ? {
              ...entry,
              text: updatedText,
            }
          : entry
      )
    );

    return {
      success: true,
      message: "Journal entry updated.",
    };
  };

  const handleDeleteJournalEntry = (payload: { id: string }): CreateJournalResult => {
    setJournalEntries((previous) => previous.filter((entry) => entry.id !== payload.id));
    return {
      success: true,
      message: "Journal entry deleted.",
    };
  };

  const renderContent = () => {
    if (role === 'athlete') {
      if (!activeUser) return null;
      if (page === 'dashboard') return <AthleteDashboard />;
      if (page === 'programs') return <ProgramMarketplace />;
      if (page === 'messages') return <Messaging />;
      if (page === 'journal') {
        return (
          <AthleteJournal
            athleteEmail={activeUser.email}
            athleteName={activeUser.name}
            entries={journalEntries.filter((entry) => entry.athleteEmail.toLowerCase() === activeUser.email.toLowerCase())}
            onCreateEntry={handleCreateJournalEntry}
            onUpdateEntry={handleUpdateJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        );
      }
      if (page === 'profile') return <AthleteProfile />;
    }
    if (role === 'coach') {
      return <CoachView currentPage={page} onNavigate={setPage} />;
    }
    if (role === 'admin') {
      return (
        <AdminView
          currentPage={page}
          onCreateCoach={handleCoachCreation}
          onCreateAthleteProfile={handleAthleteProfileCreation}
          athletes={athletes}
          coaches={accounts.filter((account) => account.role === "coach")}
          journalEntries={journalEntries}
        />
      );
    }
    return null;
  };

  if (!activeUser) {
    return <LoginPage onLogin={handleLogin} onAthleteSignUp={handleAthleteSignUp} />;
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
