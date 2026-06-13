// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { Dumbbell, LayoutDashboard, MessageSquare, Calendar, Users, FileText, ClipboardList, ShieldCheck, ChevronRight, LogOut, Zap } from "lucide-react";

type Role = 'athlete' | 'coach' | 'admin';
type Page = string;

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const athleteNav: NavItem[] = [
  { id: 'dashboard', label: 'Today\'s Training', icon: <Dumbbell size={18} /> },
  { id: 'programs', label: 'Programs', icon: <LayoutDashboard size={18} /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} /> },
  { id: 'profile', label: 'Profile', icon: <Users size={18} /> },
];

const coachNav: NavItem[] = [
  { id: 'coach-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'coach-athletes', label: 'Athletes', icon: <Users size={18} /> },
  { id: 'coach-calendar', label: 'Calendar', icon: <Calendar size={18} /> },
  { id: 'coach-messages', label: 'Messages', icon: <MessageSquare size={18} /> },
];

const adminNav: NavItem[] = [
  { id: 'admin-dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'admin-contracts', label: 'Contracts', icon: <FileText size={18} /> },
  { id: 'admin-requests', label: 'Custom Requests', icon: <ClipboardList size={18} /> },
  { id: 'admin-groups', label: 'Groups', icon: <ShieldCheck size={18} /> },
];

interface SidebarProps {
  role: Role;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onRoleChange: (role: Role) => void;
}

const roleLabels: Record<Role, string> = {
  athlete: 'Athlete',
  coach: 'Coach',
  admin: 'Admin',
};

const roleColors: Record<Role, string> = {
  athlete: 'text-[#ff5500]',
  coach: 'text-[#60a5fa]',
  admin: 'text-[#a78bfa]',
};

export function Sidebar({ role, currentPage, onNavigate, onRoleChange }: SidebarProps) {
  const navItems = role === 'athlete' ? athleteNav : role === 'coach' ? coachNav : adminNav;

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <div className="text-foreground tracking-widest uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.12em' }}>AFSP</div>
            <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.05em' }}>PERFORMANCE</div>
          </div>
        </div>
      </div>

      {/* Role switcher */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>View as</div>
        <div className="flex gap-1.5">
          {(['athlete', 'coach', 'admin'] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={`flex-1 py-1.5 text-center transition-all cursor-pointer border ${role === r ? 'bg-primary border-primary text-white' : 'bg-transparent border-border text-muted-foreground hover:border-muted-foreground'}`}
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all cursor-pointer group relative ${
                active
                  ? 'text-white bg-secondary'
                  : 'text-sidebar-foreground hover:text-white hover:bg-sidebar-accent'
              }`}
            >
              {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
              <span className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground transition-colors'}>
                {item.icon}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: active ? 700 : 600, letterSpacing: '0.04em' }}>
                {item.label}
              </span>
              {active && <ChevronRight size={14} className="ml-auto text-primary" />}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }} className={roleColors[role]}>
              {role === 'athlete' ? 'JC' : role === 'coach' ? 'MW' : 'AD'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-foreground truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.03em' }}>
              {role === 'athlete' ? 'Jordan Cole' : role === 'coach' ? 'Marcus Webb' : 'Admin'}
            </div>
            <div className={`${roleColors[role]} uppercase`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
              {roleLabels[role]}
            </div>
          </div>
          <button className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
