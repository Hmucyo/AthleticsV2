// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { Dumbbell, LayoutDashboard, MessageSquare, Calendar, Users, FileText, ClipboardList, ShieldCheck, ChevronRight, LogOut, Menu, X, Bell } from "lucide-react";
import afspLogo from "../../assets/afsp-logo.png";
import { useIsMobile } from "./ui/use-mobile";

type Role = "athlete" | "coach" | "admin";
type Page = string;

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const athleteNav: NavItem[] = [
  { id: "dashboard", label: "Training Calendar", icon: <Dumbbell size={18} /> },
  { id: "programs", label: "Programs", icon: <LayoutDashboard size={18} /> },
  { id: "messages", label: "Messages", icon: <MessageSquare size={18} /> },
  { id: "journal", label: "Journal", icon: <ClipboardList size={18} /> },
  { id: "profile", label: "Profile", icon: <Users size={18} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
];

const coachNav: NavItem[] = [
  { id: "coach-dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "coach-athletes", label: "Athletes", icon: <Users size={18} /> },
  { id: "coach-calendar", label: "Calendar", icon: <Calendar size={18} /> },
  { id: "coach-messages", label: "Messages", icon: <MessageSquare size={18} /> },
];

const adminNav: NavItem[] = [
  { id: "admin-dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { id: "admin-coaches", label: "Coaches", icon: <Users size={18} /> },
  { id: "admin-athletes", label: "Athletes", icon: <Users size={18} /> },
  { id: "admin-exercises", label: "Exercises", icon: <Dumbbell size={18} /> },
  { id: "admin-programs", label: "Programs", icon: <LayoutDashboard size={18} /> },
  { id: "admin-messages", label: "Messages", icon: <MessageSquare size={18} /> },
  { id: "admin-contracts", label: "Contracts", icon: <FileText size={18} /> },
  { id: "admin-requests", label: "Custom Requests", icon: <ClipboardList size={18} /> },
  { id: "admin-groups", label: "Groups", icon: <ShieldCheck size={18} /> },
];

interface SidebarProps {
  role: Role;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void | Promise<void>;
  currentUserName: string;
  notificationUnreadCount?: number;
}

const roleLabels: Record<Role, string> = {
  athlete: "Athlete",
  coach: "Coach",
  admin: "Admin",
};

const roleColors: Record<Role, string> = {
  athlete: "text-[#ff5500]",
  coach: "text-[#60a5fa]",
  admin: "text-[#a78bfa]",
};

export function Sidebar({ role, currentPage, onNavigate, onLogout, currentUserName, notificationUnreadCount = 0 }: SidebarProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = role === "athlete" ? athleteNav : role === "coach" ? coachNav : adminNav;
  const initials = currentUserName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const panel = (
    <aside className="w-72 max-w-[85vw] md:w-60 flex-shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border h-full">
      <div className="px-4 py-3 border-b border-sidebar-border flex items-center gap-2">
        <img src={afspLogo} alt="Authentic Fitness & Sports Performance" className="w-full h-14 md:h-16 object-contain bg-white" />
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="shrink-0 p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-4 py-3 border-b border-sidebar-border">
        <div
          className="text-muted-foreground mb-1"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          Signed in as
        </div>
        <div
          className={`${roleColors[role]} uppercase`}
          style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em" }}
        >
          {roleLabels[role]}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all cursor-pointer group relative ${
                active ? "text-white bg-secondary" : "text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
              }`}
            >
              {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
              <span className={active ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"}>
                {item.icon}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: active ? 700 : 600, letterSpacing: "0.04em" }}>
                {item.label}
              </span>
              {item.id === "notifications" && notificationUnreadCount > 0 ? (
                <span
                  className="ml-auto min-w-5 h-5 px-1.5 bg-primary text-white flex items-center justify-center"
                  style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 800 }}
                >
                  {notificationUnreadCount > 9 ? "9+" : notificationUnreadCount}
                </span>
              ) : (
                active && <ChevronRight size={14} className="ml-auto text-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0">
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem" }} className={roleColors[role]}>
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-foreground truncate"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.03em" }}
            >
              {currentUserName}
            </div>
            <div className={`${roleColors[role]} uppercase`} style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
              {roleLabels[role]}
            </div>
          </div>
          <button type="button" onClick={onLogout} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        <header className="md:hidden flex items-center gap-3 px-3 py-2.5 border-b border-border bg-sidebar shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 text-foreground hover:bg-secondary cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <img src={afspLogo} alt="AFSP" className="h-10 w-auto object-contain bg-white" />
          <div className="ml-auto min-w-0 text-right">
            <div className={`${roleColors[role]} uppercase truncate`} style={{ fontFamily: "var(--font-display)", fontSize: "0.7rem", fontWeight: 700 }}>
              {roleLabels[role]}
            </div>
          </div>
        </header>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" className="absolute inset-0 bg-black/70 cursor-pointer" aria-label="Close menu overlay" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 shadow-xl">{panel}</div>
          </div>
        )}
      </>
    );
  }

  return panel;
}
