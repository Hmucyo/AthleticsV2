// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { Users, TrendingUp, Plus, Video, ChevronDown, ChevronUp, CheckCircle2, Circle, Edit3, Calendar, Clock, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MessagingPanel } from "../messaging/MessagingPanel";
import { startDirectMessage, type Conversation, type MessagingUser } from "../../../lib/messaging";

type CoachTab = 'dashboard' | 'athletes' | 'calendar' | 'messages';

const athletes = [
  { id: 1, name: 'Jordan Cole', program: 'Elite Strength', week: '7 / 12', compliance: 94, lastActive: 'Today', pr: 'Bench 195 lbs', status: 'Active' },
  { id: 2, name: 'Tyler Ramos', program: 'Elite Strength', week: '7 / 12', compliance: 88, lastActive: 'Today', pr: 'Squat 315 lbs', status: 'Active' },
  { id: 3, name: 'Kira Voss', program: 'Elite Strength', week: '4 / 12', compliance: 72, lastActive: 'Yesterday', pr: 'Deadlift 225 lbs', status: 'Needs attention' },
  { id: 4, name: 'DeShawn Grant', program: 'Elite Strength', week: '10 / 12', compliance: 98, lastActive: 'Today', pr: 'Total 1,105 lbs', status: 'Active' },
  { id: 5, name: 'Rosa Mendez', program: 'Elite Strength', week: '2 / 12', compliance: 85, lastActive: '2 days ago', pr: 'OHP 75 lbs', status: 'Active' },
];

const sessions = [
  { id: 1, date: 'Fri Jun 13', time: '7:00 AM', title: 'Upper Body — Group Session', type: 'In-Person', athletes: 5, location: 'Platform 2', link: null },
  { id: 2, date: 'Mon Jun 16', time: '6:30 PM', title: 'Lower Body — Virtual Check-In', type: 'Virtual', athletes: 5, location: null, link: 'https://meet.google.com/abc-defg-hij' },
  { id: 3, date: 'Wed Jun 18', time: '7:00 AM', title: 'Max Effort Squat Day', type: 'In-Person', athletes: 5, location: 'Platform 2', link: null },
  { id: 4, date: 'Fri Jun 20', time: '7:00 AM', title: 'Upper Body Volume', type: 'In-Person', athletes: 5, location: 'Platform 2', link: null },
];

const weekLoad = [
  { day: 'MON', avg: 78 },
  { day: 'TUE', avg: 82 },
  { day: 'WED', avg: 71 },
  { day: 'THU', avg: 88 },
  { day: 'FRI', avg: 85 },
  { day: 'SAT', avg: 61 },
  { day: 'SUN', avg: 0 },
];

const exercises = [
  { id: 1, name: 'Barbell Squat', type: 'Compound', sets: '5x3', load: '90% 1RM', notes: 'Competition opener prep' },
  { id: 2, name: 'Romanian Deadlift', type: 'Accessory', sets: '3x8', load: '135 lbs', notes: 'Hamstring control focus' },
  { id: 3, name: 'Leg Press', type: 'Accessory', sets: '4x10', load: '320 lbs', notes: 'Drop set on last set' },
];

interface CoachViewProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: MessagingUser;
  conversations: Conversation[];
  onConversationsChange: (updater: Conversation[] | ((previous: Conversation[]) => Conversation[])) => void;
  messagingDirectory: MessagingUser[];
}

export function CoachView({
  currentPage,
  onNavigate,
  currentUser,
  conversations,
  onConversationsChange,
  messagingDirectory,
}: CoachViewProps) {
  const [expandedAthlete, setExpandedAthlete] = useState<number | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState('');

  const messageAthleteByName = (athleteName: string) => {
    const target = messagingDirectory.find(
      (user) => user.role === "athlete" && user.name.toLowerCase() === athleteName.toLowerCase()
    );
    if (!target) {
      onNavigate("coach-messages");
      return;
    }
    onConversationsChange((previous) => {
      const result = startDirectMessage({
        conversations: previous,
        from: currentUser,
        to: target,
        openingText: `Hi ${target.name.split(" ")[0]}, checking in from coaching.`,
      });
      return result.conversations;
    });
    onNavigate("coach-messages");
  };

  if (currentPage === 'coach-messages') {
    return (
      <MessagingPanel
        role="coach"
        currentUser={currentUser}
        conversations={conversations}
        onConversationsChange={onConversationsChange}
        directory={messagingDirectory}
      />
    );
  }
  if (currentPage === 'coach-dashboard') {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>COACH PORTAL</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            COACH<br /><span className="text-[#60a5fa]">DASHBOARD</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Active Athletes', value: '5', icon: <Users size={15} />, color: '#60a5fa' },
            { label: 'Avg Compliance', value: '87%', icon: <TrendingUp size={15} />, color: '#4ade80' },
            { label: 'Sessions This Week', value: '2', icon: <Calendar size={15} />, color: '#ff8c42' },
            { label: 'Weeks Active', value: '7', icon: <Clock size={15} />, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>{s.label}</span>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Load chart + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border p-4 md:p-5">
            <div className="text-muted-foreground uppercase mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Group Weekly Load (Avg)</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekLoad} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <XAxis dataKey="day" tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#636b75', letterSpacing: '0.08em' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#636b75' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#131618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }} labelStyle={{ color: '#eef0f2' }} itemStyle={{ color: '#60a5fa' }} />
                <Bar dataKey="avg" radius={0} name="Load %">
                  {weekLoad.map((entry, idx) => (
                    <Cell key={idx} fill={entry.avg >= 85 ? '#ff5500' : entry.avg > 0 ? '#60a5fa' : '#1e2225'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border p-5">
            <div className="text-muted-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Needs Attention</div>
            <div className="space-y-3">
              {athletes.filter(a => a.status !== 'Active').map(a => (
                <div key={a.id} className="p-3 border border-[#ff8c42]/30 bg-[#ff8c42]/5">
                  <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>{a.name}</div>
                  <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>Compliance: {a.compliance}% · Last: {a.lastActive}</div>
                </div>
              ))}
              {athletes.filter(a => a.status !== 'Active').length === 0 && (
                <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>All athletes on track.</div>
              )}
            </div>
          </div>
        </div>

        {/* Next session */}
        <div className="bg-card border border-border p-4 md:p-5">
          <div className="text-muted-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Next Session</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <div className="min-w-0">
              <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.04em' }}>{sessions[0].title}</div>
              <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{sessions[0].date} · {sessions[0].time} · {sessions[0].location}</div>
            </div>
            <div className="sm:ml-auto flex gap-2">
              <button onClick={() => onNavigate('coach-calendar')} className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer uppercase w-full sm:w-auto" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                View Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'coach-athletes') {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>ATHLETE ROSTER</div>
            <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
              YOUR<br /><span className="text-[#60a5fa]">ATHLETES</span>
            </h1>
          </div>
        </div>

        <div className="space-y-2">
          {athletes.map(a => {
            const open = expandedAthlete === a.id;
            return (
              <div key={a.id} className="bg-card border border-border">
                <div
                  className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 cursor-pointer hover:bg-muted transition-all"
                  onClick={() => setExpandedAthlete(open ? null : a.id)}
                >
                  <div className="w-9 h-9 flex items-center justify-center bg-secondary border border-border flex-shrink-0">
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', color: '#60a5fa' }}>{a.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground uppercase truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em' }}>{a.name}</div>
                    <div className="text-muted-foreground truncate" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.06em' }}>Week {a.week} · Last active: {a.lastActive}</div>
                  </div>
                  <div className="text-center px-2 sm:px-4 flex-shrink-0">
                    <div className={`${a.compliance >= 90 ? 'text-[#4ade80]' : a.compliance >= 80 ? 'text-[#ff8c42]' : 'text-destructive'}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>{a.compliance}%</div>
                    <div className="text-muted-foreground hidden sm:block" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Compliance</div>
                  </div>
                  <div className={`px-2.5 py-1 border text-center ${a.status === 'Active' ? 'border-[#4ade80]/30 text-[#4ade80]' : 'border-[#ff8c42]/30 text-[#ff8c42]'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {a.status}
                  </div>
                  <span className="text-muted-foreground">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                </div>
                {open && (
                  <div className="border-t border-border px-5 py-4 bg-muted space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>Recent PR</div>
                        <div className="text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{a.pr}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>Program</div>
                        <div className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{a.program}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>Today's Exercise Status</div>
                      <div className="space-y-1.5">
                        {exercises.map(ex => (
                          <div key={ex.id} className="flex items-center gap-3">
                            {a.compliance > 85 ? <CheckCircle2 size={15} className="text-[#4ade80]" /> : <Circle size={15} className="text-muted-foreground" />}
                            <span className="text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>{ex.name}</span>
                            <span className="text-muted-foreground ml-auto" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{ex.sets}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => messageAthleteByName(a.name)}
                        className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer uppercase"
                        style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}
                      >
                        Message
                      </button>
                      <button className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        View Full Profile
                      </button>
                      <button className="px-3 py-1.5 bg-[#60a5fa]/10 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/20 transition-all cursor-pointer uppercase flex items-center gap-1.5" style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        <Plus size={13} /> Assign Exercise
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Program Exercises */}
        <div className="bg-card border border-border p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>Elite Strength — Today's Programming</h3>
            <button
              onClick={() => setShowAddExercise(!showAddExercise)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#60a5fa]/10 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/20 transition-all cursor-pointer uppercase w-full sm:w-auto"
              style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}
            >
              <Plus size={13} /> Add Exercise
            </button>
          </div>
          {showAddExercise && (
            <div className="mb-4 p-4 border border-border bg-muted flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-muted-foreground mb-1 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>Exercise Name</label>
                <input value={newExName} onChange={e => setNewExName(e.target.value)} placeholder="e.g. Pause Squat" className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }} />
              </div>
              <button onClick={() => setShowAddExercise(false)} className="px-4 py-2 bg-[#60a5fa] text-white cursor-pointer hover:opacity-90 transition-opacity uppercase w-full sm:w-auto" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>Add</button>
            </div>
          )}
          <div className="space-y-2">
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="flex flex-wrap items-center gap-2 sm:gap-4 py-2.5 border-b border-border last:border-0">
                <span className="text-muted-foreground w-5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{String(idx + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-[8rem]">
                  <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.04em' }}>{ex.name}</div>
                  <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem' }}>{ex.notes}</div>
                </div>
                <span className="text-muted-foreground px-2 py-0.5 border border-border" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>{ex.sets}</span>
                <span className="text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>{ex.load}</span>
                <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><Edit3 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'coach-calendar') {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>SESSION CALENDAR</div>
            <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
              UPCOMING<br /><span className="text-[#60a5fa]">SESSIONS</span>
            </h1>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#60a5fa] text-white hover:opacity-90 transition-opacity cursor-pointer uppercase w-full sm:w-auto" style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.06em' }}>
            <Plus size={15} /> Schedule Session
          </button>
        </div>

        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="bg-card border border-border p-4 md:p-5 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
              <div className="border-l-2 border-[#60a5fa] pl-4 min-w-0 flex-1">
                <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{s.date} · {s.time}</div>
                <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.04em' }}>{s.title}</div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                  <span className={`px-2 py-0.5 border uppercase ${s.type === 'Virtual' ? 'border-[#60a5fa]/30 text-[#60a5fa]' : 'border-border text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>{s.type}</span>
                  <span className="text-muted-foreground flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>
                    <Users size={12} /> {s.athletes} athletes
                  </span>
                  {s.location && <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>{s.location}</span>}
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-wrap gap-2 sm:ml-auto">
                {s.link && (
                  <a href={s.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#60a5fa]/10 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    <Video size={13} /> Join <ExternalLink size={11} />
                  </a>
                )}
                <button className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
