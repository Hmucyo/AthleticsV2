// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { AthleteDashboard } from "./components/athlete/AthleteDashboard";
import { ProgramMarketplace } from "./components/athlete/ProgramMarketplace";
import { Messaging } from "./components/athlete/Messaging";
import { AthleteProfile } from "./components/athlete/AthleteProfile";
import { CoachView } from "./components/coach/CoachView";
import { AdminView } from "./components/admin/AdminView";

type Role = 'athlete' | 'coach' | 'admin';

const defaultPage: Record<Role, string> = {
  athlete: 'dashboard',
  coach: 'coach-dashboard',
  admin: 'admin-dashboard',
};

export default function App() {
  const [role, setRole] = useState<Role>('athlete');
  const [page, setPage] = useState<string>('dashboard');

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setPage(defaultPage[newRole]);
  };

  const renderContent = () => {
    if (role === 'athlete') {
      if (page === 'dashboard') return <AthleteDashboard />;
      if (page === 'programs') return <ProgramMarketplace />;
      if (page === 'messages') return <Messaging />;
      if (page === 'profile') return <AthleteProfile />;
    }
    if (role === 'coach') {
      return <CoachView currentPage={page} onNavigate={setPage} />;
    }
    if (role === 'admin') {
      return <AdminView currentPage={page} />;
    }
    return null;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar role={role} currentPage={page} onNavigate={setPage} onRoleChange={handleRoleChange} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
