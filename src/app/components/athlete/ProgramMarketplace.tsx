// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useMemo, useState } from "react";
import { Search, Filter, Star, Clock, Users, ChevronRight, Check, X, CreditCard, Dumbbell } from "lucide-react";
import type { ExerciseItem, ProgramItem } from "../../../lib/training";

const catalogMeta = [
  {
    name: "Elite Strength",
    coach: "Marcus Webb",
    coachAvatar: "MW",
    duration: "12 weeks",
    price: 149,
    type: ["In-Person", "Virtual"],
    level: "Advanced",
    category: "Strength",
    athletes: 24,
    rating: 4.9,
    reviews: 47,
    description:
      "Periodized strength program focused on powerlifting fundamentals. Includes progressive overload protocols, technique refinement, and competition prep phases.",
    includes: ["Daily programming", "Weekly video check-ins", "Form review", "Nutrition guidelines"],
    color: "#ff5500",
  },
  {
    name: "Sprint Mechanics",
    coach: "Aisha Kim",
    coachAvatar: "AK",
    duration: "8 weeks",
    price: 99,
    type: ["In-Person", "Hybrid"],
    level: "Intermediate",
    category: "Speed",
    athletes: 18,
    rating: 4.8,
    reviews: 31,
    description:
      "Track-based speed development focusing on acceleration mechanics, max velocity, and speed-endurance. Ideal for team sport athletes.",
    includes: ["3x/week track sessions", "Strength supplement work", "Video analysis", "Recovery protocols"],
    color: "#60a5fa",
  },
  {
    name: "Recovery & Mobility",
    coach: "James Ortega",
    coachAvatar: "JO",
    duration: "6 weeks",
    price: 79,
    type: ["Virtual"],
    level: "All Levels",
    category: "Recovery",
    athletes: 52,
    rating: 4.7,
    reviews: 89,
    description:
      "Comprehensive mobility and injury prevention program. Combines yoga, corrective exercise, and soft tissue work for sustained performance.",
    includes: ["Daily mobility sessions", "Self-myofascial release", "Breath work", "Sleep protocols"],
    color: "#4ade80",
  },
];

const fallbackColors = ["#ff5500", "#60a5fa", "#4ade80", "#a78bfa", "#ff8c42"];

type ModalState = "details" | "enroll" | "payment" | "success" | null;

interface CatalogProgram {
  id: string;
  name: string;
  coach: string;
  coachAvatar: string;
  duration: string;
  price: number;
  type: string[];
  level: string;
  category: string;
  athletes: number;
  rating: number;
  reviews: number;
  description: string;
  includes: string[];
  color: string;
  exerciseIds: string[];
}

interface ProgramMarketplaceProps {
  onGoToDashboard?: () => void;
  programs: ProgramItem[];
  exercises: ExerciseItem[];
}

export function ProgramMarketplace({ onGoToDashboard, programs, exercises }: ProgramMarketplaceProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selected, setSelected] = useState<CatalogProgram | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [enrollType, setEnrollType] = useState("Virtual");
  const [duration, setDuration] = useState(1);
  const [customMode, setCustomMode] = useState(false);

  const exerciseById = useMemo(() => {
    const map = new Map<string, ExerciseItem>();
    exercises.forEach((exercise) => map.set(exercise.id, exercise));
    return map;
  }, [exercises]);

  const catalog = useMemo<CatalogProgram[]>(() => {
    return programs.map((program, index) => {
      const meta = catalogMeta.find((item) => item.name.toLowerCase() === program.name.toLowerCase());
      const color = meta?.color ?? fallbackColors[index % fallbackColors.length];
      return {
        id: program.id,
        name: program.name,
        coach: meta?.coach ?? "AFSP Coaching",
        coachAvatar: meta?.coachAvatar ?? "AF",
        duration: meta?.duration ?? "Custom",
        price: meta?.price ?? 99,
        type: meta?.type ?? ["Virtual"],
        level: meta?.level ?? "All Levels",
        category: meta?.category ?? "Program",
        athletes: meta?.athletes ?? 0,
        rating: meta?.rating ?? 5,
        reviews: meta?.reviews ?? 0,
        description:
          meta?.description ??
          `${program.name} program with ${program.exerciseIds.length} exercise${program.exerciseIds.length === 1 ? "" : "s"} assigned by administration.`,
        includes: meta?.includes ?? ["Admin-managed exercise library", "Calendar day assignments", "Progress tracking"],
        color,
        exerciseIds: program.exerciseIds,
      };
    });
  }, [programs]);

  const filtered = catalog.filter((program) => {
    const matchSearch =
      program.name.toLowerCase().includes(search.toLowerCase()) ||
      program.coach.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || program.type.includes(filterType);
    return matchSearch && matchType;
  });

  const selectedExercises = selected
    ? selected.exerciseIds
        .map((id) => exerciseById.get(id))
        .filter((exercise): exercise is ExerciseItem => Boolean(exercise))
    : [];

  const openProgram = (program: CatalogProgram) => {
    setSelected(program);
    setEnrollType(program.type[0] ?? "Virtual");
    setModal("details");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-4 border border-[#ff8c42]/40 bg-[#ff8c42]/10 px-3 py-2 text-[#ff8c42]" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
        Programs and their exercise lists come from the admin library. Enrollment checkout is still demo-only.
      </div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>PROGRAM CATALOG</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            FIND YOUR<br /><span className="text-primary">PROGRAM</span>
          </h1>
        </div>
        <button
          onClick={() => setCustomMode(true)}
          className="px-5 py-2.5 border border-primary text-primary hover:bg-primary hover:text-white transition-all cursor-pointer uppercase"
          style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          + Custom Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search programs or coaches..."
            className="w-full bg-secondary border border-border pl-9 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
          />
        </div>
        <div className="flex items-center gap-2 border border-border px-3 bg-secondary overflow-x-auto">
          <Filter size={14} className="text-muted-foreground flex-shrink-0" />
          {['All', 'Virtual', 'In-Person', 'Hybrid'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-2.5 py-1 cursor-pointer transition-all whitespace-nowrap ${filterType === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Program grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full bg-card border border-border p-5 text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
            No programs available yet. An admin can create programs and assign exercises to them.
          </div>
        )}
        {filtered.map(p => (
          <div key={p.id} className="bg-card border border-border hover:border-[rgba(255,255,255,0.18)] transition-all cursor-pointer group" onClick={() => openProgram(p)}>
            <div className="h-1.5" style={{ background: p.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{p.category}</div>
                  <h3 className="text-foreground uppercase group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', lineHeight: 1, letterSpacing: '0.04em' }}>{p.name}</h3>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} fill={p.color} stroke={p.color} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: p.color }}>{p.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-border">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.55rem', color: p.color }}>{p.coachAvatar}</span>
                </div>
                <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>{p.coach}</span>
              </div>

              <p className="text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.55 }}>{p.description.slice(0, 90)}...</p>

              <div className="flex items-center gap-4 border-t border-border pt-3 mt-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Dumbbell size={12} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{p.exerciseIds.length} exercises</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={12} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{p.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users size={12} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{p.athletes} athletes</span>
                </div>
                <div className="ml-auto" style={{ color: p.color, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                  ${p.price}<span className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 400 }}>/mo</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Request Modal */}
      {customMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.06em' }}>Custom Program Request</h2>
              <button onClick={() => setCustomMode(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Primary Goal', placeholder: 'e.g. Increase vertical jump by 4 inches' },
                { label: 'Current Level', placeholder: 'e.g. Intermediate, 3 years training' },
                { label: 'Available Equipment', placeholder: 'e.g. Full gym access, barbell, dumbbells' },
                { label: 'Time Commitment', placeholder: 'e.g. 5 days/week, 60-90 min sessions' },
                { label: 'Injury History / Limitations', placeholder: 'e.g. Previous left knee surgery, avoid deep squats' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-muted-foreground mb-1.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
                  />
                </div>
              ))}
              <button
                onClick={() => setCustomMode(false)}
                className="w-full py-3 bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer uppercase"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.08em' }}
              >
                Submit Request → Admin Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Details Modal */}
      {selected && modal === 'details' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="h-1.5" style={{ background: selected.color }} />
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="text-muted-foreground uppercase mb-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{selected.category}</div>
                <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.04em' }}>{selected.name}</h2>
              </div>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5">
              <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.6 }}>{selected.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Coach', value: selected.coach },
                  { label: 'Duration', value: selected.duration },
                  { label: 'Level', value: selected.level },
                  { label: 'Price', value: `$${selected.price}/mo` },
                  { label: 'Athletes Enrolled', value: `${selected.athletes} active` },
                  { label: 'Rating', value: `${selected.rating} (${selected.reviews} reviews)` },
                ].map(item => (
                  <div key={item.label} className="bg-secondary p-3">
                    <div className="text-muted-foreground mb-0.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>{item.label}</div>
                    <div className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em' }}>Exercise List</div>
                {selectedExercises.length === 0 ? (
                  <div className="text-muted-foreground border border-border px-3 py-2" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
                    No exercises assigned to this program yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedExercises.map((exercise, index) => (
                      <div key={exercise.id} className="border border-border px-3 py-2">
                        <div className="text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                          {String(index + 1).padStart(2, "0")} · {exercise.name}
                        </div>
                        <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem' }}>
                          {exercise.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="text-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em' }}>What's Included</div>
                <div className="space-y-1.5">
                  {selected.includes.map(inc => (
                    <div key={inc} className="flex items-center gap-2.5">
                      <Check size={14} style={{ color: selected.color }} />
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-muted-foreground mb-1.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>Session Type</label>
                  <select value={enrollType} onChange={e => setEnrollType(e.target.value)} className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                    {selected.type.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-muted-foreground mb-1.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>Duration</label>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                    {[1, 2, 3, 6].map(m => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div className="border border-border p-3 flex items-center justify-between">
                <div>
                  <div className="text-muted-foreground mb-0.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>Total Due</div>
                  <div className="text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>${selected.price * duration}<span className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 400 }}> for {duration} mo</span></div>
                </div>
                <button
                  onClick={() => setModal('payment')}
                  className="flex items-center gap-2 px-5 py-2.5 text-white hover:opacity-90 transition-opacity cursor-pointer uppercase"
                  style={{ background: selected.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em' }}
                >
                  Enroll Now <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selected && modal === 'payment' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.06em' }}>Payment</h2>
              <button onClick={() => setModal('details')} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-secondary p-3 border border-border flex items-center justify-between">
                <div>
                  <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>{selected.name}</div>
                  <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{enrollType} · {duration} month{duration > 1 ? 's' : ''}</div>
                </div>
                <div className="text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>${selected.price * duration}</div>
              </div>
              {[
                { label: 'Name on Card', placeholder: 'Jordan Cole', type: 'text' },
                { label: 'Card Number', placeholder: '4242 4242 4242 4242', type: 'text' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-muted-foreground mb-1.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{f.label}</label>
                  <input placeholder={f.placeholder} type={f.type} className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Expiry', placeholder: 'MM / YY' }, { label: 'CVC', placeholder: '123' }].map(f => (
                  <div key={f.label}>
                    <label className="block text-muted-foreground mb-1.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full bg-secondary border border-border px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }} />
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground p-3 border border-[#ff8c42]/40 bg-[#ff8c42]/10" style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                Demo only — payments are not processed yet. Confirming will not charge a card.
              </div>
              <button
                onClick={() => setModal('success')}
                className="w-full py-3 text-white hover:opacity-90 transition-opacity cursor-pointer uppercase flex items-center justify-center gap-2"
                style={{ background: selected.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.08em' }}
              >
                <CreditCard size={16} /> Continue Demo Enrollment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {selected && modal === 'success' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border w-full max-w-sm text-center p-8">
            <div className="w-16 h-16 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mx-auto mb-5">
              <Check size={32} className="text-[#4ade80]" />
            </div>
            <h2 className="text-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.06em' }}>Demo Enrollment Saved</h2>
            <p className="text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.6 }}>You previewed enrollment in <strong className="text-foreground">{selected.name}</strong>. No payment was taken.</p>
            <p className="text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>Live billing and contracts will connect in a later release.</p>
            <button
              onClick={() => {
                closeModal();
                onGoToDashboard?.();
              }}
              className="px-6 py-2.5 bg-primary text-white hover:opacity-90 cursor-pointer uppercase"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
