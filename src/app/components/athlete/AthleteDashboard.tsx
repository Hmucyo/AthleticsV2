// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Flame, TrendingUp, Clock, Target, BarChart2, Play } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const exercises = [
  { id: 1, name: 'Barbell Bench Press', sets: 4, reps: 8, weight: '185 lbs', rest: '2 min', category: 'Chest', notes: 'Control the descent. 3-second eccentric.' },
  { id: 2, name: 'Weighted Pull-Ups', sets: 3, reps: 10, weight: '+25 lbs', rest: '90 sec', category: 'Back', notes: 'Full range of motion. Dead hang at bottom.' },
  { id: 3, name: 'Overhead Press', sets: 3, reps: 10, weight: '95 lbs', rest: '90 sec', category: 'Shoulders', notes: 'Brace core throughout. No lower back arch.' },
  { id: 4, name: 'Pendlay Row', sets: 4, reps: 8, weight: '155 lbs', rest: '2 min', category: 'Back', notes: 'Explosive pull. Reset on floor each rep.' },
  { id: 5, name: 'Incline DB Press', sets: 3, reps: 12, weight: '70 lbs', rest: '75 sec', category: 'Chest', notes: '30-degree incline. Slow on the way down.' },
  { id: 6, name: 'Face Pulls', sets: 3, reps: 15, weight: '50 lbs', rest: '60 sec', category: 'Shoulders', notes: 'External rotation at the peak.' },
];

const weeklyData = [
  { day: 'MON', load: 82, target: 85 },
  { day: 'TUE', load: 75, target: 75 },
  { day: 'WED', load: 0, target: 60 },
  { day: 'THU', load: 90, target: 85 },
  { day: 'FRI', load: 88, target: 90 },
  { day: 'SAT', load: 65, target: 65 },
  { day: 'SUN', load: 0, target: 0 },
];

const completionData = [{ name: 'Progress', value: 67, fill: '#ff5500' }, { name: 'Remaining', value: 33, fill: '#1e2225' }];

interface AthleteDashboardProps {
  athleteName?: string;
}

export function AthleteDashboard({ athleteName = "Athlete" }: AthleteDashboardProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set([1, 2]));
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'workout' | 'progress'>('workout');

  const toggle = (id: number) => {
    const next = new Set(completed);
    next.has(id) ? next.delete(id) : next.add(id);
    setCompleted(next);
  };

  const pct = Math.round((completed.size / exercises.length) * 100);
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase();

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="border border-[#ff8c42]/40 bg-[#ff8c42]/10 px-3 py-2 text-[#ff8c42]" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
        Welcome, {athleteName}. Today&apos;s workout card is demo content until programs are connected to your account.
      </div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
            {todayLabel}
          </div>
          <h1 className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            UPPER BODY<br />
            <span className="text-primary">STRENGTH</span>
          </h1>
          <div className="text-muted-foreground mt-1.5" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
            Week 7 of 12 · Elite Strength · Coach Marcus Webb
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('workout')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'workout' ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground hover:text-foreground'}`}
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Workout
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === 'progress' ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground hover:text-foreground'}`}
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Progress
          </button>
        </div>
      </div>

      {activeTab === 'workout' && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Completed', value: `${completed.size}/${exercises.length}`, icon: <Target size={16} className="text-primary" />, sub: 'exercises' },
              { label: 'Est. Duration', value: '68', icon: <Clock size={16} className="text-[#60a5fa]" />, sub: 'minutes' },
              { label: 'Total Volume', value: '~12,400', icon: <TrendingUp size={16} className="text-[#4ade80]" />, sub: 'lbs' },
              { label: 'Streak', value: '14', icon: <Flame size={16} className="text-[#ff8c42]" />, sub: 'days' },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{stat.label}</span>
                  {stat.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', lineHeight: 1, letterSpacing: '0.02em' }} className="text-foreground">{stat.value}</div>
                <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-card border border-border p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.06em' }}>Session Progress</span>
              <span className="text-primary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500 }}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-secondary">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Exercise list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.06em' }}>Exercises</h2>
              <button className="flex items-center gap-1.5 text-primary cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <Play size={14} fill="currentColor" /> Start Session
              </button>
            </div>
            {exercises.map((ex, idx) => {
              const done = completed.has(ex.id);
              const open = expanded === ex.id;
              return (
                <div
                  key={ex.id}
                  className={`bg-card border transition-all ${done ? 'border-[#ff5500]/30 opacity-60' : 'border-border hover:border-[rgba(255,255,255,0.15)]'}`}
                >
                  <div className="flex items-center gap-4 px-4 py-3 cursor-pointer" onClick={() => setExpanded(open ? null : ex.id)}>
                    <span className="text-muted-foreground w-5 text-center flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{String(idx + 1).padStart(2, '0')}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggle(ex.id); }}
                      className={`flex-shrink-0 transition-colors cursor-pointer ${done ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={`${done ? 'line-through text-muted-foreground' : 'text-foreground'} uppercase`} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em' }}>{ex.name}</span>
                        <span className="text-muted-foreground px-1.5 py-0.5 border border-border" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{ex.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{ex.sets}</div>
                        <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.06em' }}>SETS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{ex.reps}</div>
                        <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.06em' }}>REPS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{ex.weight}</div>
                        <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.06em' }}>LOAD</div>
                      </div>
                      <span className="text-muted-foreground">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    </div>
                  </div>
                  {open && (
                    <div className="border-t border-border px-4 py-3 bg-muted flex items-start gap-6">
                      <div>
                        <div className="text-muted-foreground mb-1 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>Rest</div>
                        <div className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{ex.rest}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-muted-foreground mb-1 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>Coach Notes</div>
                        <div className="text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5 }}>{ex.notes}</div>
                      </div>
                      <button className="px-3 py-1.5 bg-primary text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        Log Set
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-5">
          {/* Week overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border p-5">
              <div className="text-muted-foreground uppercase mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Weekly Load</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                  <defs>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5500" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff5500" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#636b75', letterSpacing: '0.08em' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: '#636b75' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#131618', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }} labelStyle={{ color: '#eef0f2' }} itemStyle={{ color: '#ff5500' }} />
                  <Area type="monotone" dataKey="load" stroke="#ff5500" strokeWidth={2} fill="url(#loadGrad)" name="Actual" />
                  <Area type="monotone" dataKey="target" stroke="#636b75" strokeWidth={1} strokeDasharray="4 4" fill="none" name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border p-5 flex flex-col items-center justify-center">
              <div className="text-muted-foreground uppercase mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Program Completion</div>
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" data={completionData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={2} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <div className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>67%</div>
                <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>of 12 weeks</div>
              </div>
            </div>
          </div>

          {/* Personal records */}
          <div className="bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-primary" />
              <h3 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>Recent PRs</h3>
            </div>
            <div className="space-y-3">
              {[
                { lift: 'Bench Press', old: '175 lbs', new: '195 lbs', date: 'Jun 10' },
                { lift: 'Squat', old: '265 lbs', new: '285 lbs', date: 'Jun 6' },
                { lift: 'Deadlift', old: '315 lbs', new: '335 lbs', date: 'Jun 1' },
                { lift: 'Pull-Ups', old: '+20 lbs', new: '+30 lbs', date: 'May 28' },
              ].map(pr => (
                <div key={pr.lift} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.04em' }}>{pr.lift}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground line-through" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>{pr.old}</span>
                    <span className="text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>{pr.new}</span>
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{pr.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
