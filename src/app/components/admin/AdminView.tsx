// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState, type FormEvent, type ChangeEvent } from "react";
import { FileText, Download, Check, X, Eye, Clock, Users, Lock, Unlock, ChevronDown, ChevronUp, AlertCircle, ShieldCheck } from "lucide-react";
import { AdminMessaging } from "./AdminMessaging";
import type { JournalEntry } from "../athlete/AthleteJournal";

const contracts = [
  { id: 'C-2024-0089', athlete: 'Jordan Cole', program: 'Elite Strength', coach: 'Marcus Webb', amount: '$149/mo', duration: '3 months', signed: 'Jun 12, 2025', status: 'Pending', type: 'Virtual' },
  { id: 'C-2024-0088', athlete: 'Rosa Mendez', program: 'Elite Strength', coach: 'Marcus Webb', amount: '$149/mo', duration: '1 month', signed: 'Jun 10, 2025', status: 'Approved', type: 'In-Person' },
  { id: 'C-2024-0087', athlete: 'Tyler Ramos', program: 'Elite Strength', coach: 'Marcus Webb', amount: '$298/mo', duration: '2 months', signed: 'Jun 8, 2025', status: 'Approved', type: 'Hybrid' },
  { id: 'C-2024-0086', athlete: 'Kira Voss', program: 'Recovery & Mobility', coach: 'James Ortega', amount: '$79/mo', duration: '6 months', signed: 'May 30, 2025', status: 'Approved', type: 'Virtual' },
  { id: 'C-2024-0085', athlete: 'DeShawn Grant', program: 'Olympic Lifting', coach: 'Priya Sharma', amount: '$179/mo', duration: '1 month', signed: 'May 28, 2025', status: 'Rejected', type: 'In-Person' },
];

const customRequests = [
  {
    id: 'CR-041',
    athlete: 'Marcus Liu',
    submitted: 'Jun 12, 2025',
    status: 'Pending',
    goal: 'Improve 40-yard dash from 4.7s to 4.5s for NFL combine preparation',
    level: 'Advanced — 5 years training, D3 wide receiver',
    equipment: 'Full track access, weight room with sleds, cones, resistance bands',
    time: '6 days/week, 90-120 min per session',
    injury: 'Hamstring grade 1 strain (recovered Feb 2025). Cleared.',
  },
  {
    id: 'CR-040',
    athlete: 'Sasha Winters',
    submitted: 'Jun 11, 2025',
    status: 'In Review',
    goal: 'Post-pregnancy return to competitive CrossFit within 6 months',
    level: 'Intermediate — 3 years CrossFit pre-pregnancy',
    equipment: 'Home gym: pull-up bar, dumbbells to 35 lbs, jump rope, bike',
    time: '5 days/week, 45-60 min',
    injury: 'C-section recovery — cleared for full activity by OBGYN as of Jun 1',
  },
  {
    id: 'CR-039',
    athlete: 'Felipe Torres',
    submitted: 'Jun 9, 2025',
    status: 'Approved',
    goal: 'Increase vertical jump from 28" to 36" for AAU basketball',
    level: 'Intermediate — 2 years structured training',
    equipment: 'Community gym, no sled. Has weight vest.',
    time: '4 days/week, 60 min',
    injury: 'None',
  },
];

const groups = [
  { id: 1, name: 'Elite Strength', type: 'Program', members: 5, coach: 'Marcus Webb', locked: false },
  { id: 2, name: 'Sprint Mechanics', type: 'Program', members: 8, coach: 'Aisha Kim', locked: false },
  { id: 3, name: 'Recovery & Mobility', type: 'Program', members: 18, coach: 'James Ortega', locked: false },
  { id: 4, name: 'AFSP Community', type: 'Global', members: 148, coach: 'Admin', locked: false },
  { id: 5, name: 'Coaches Channel', type: 'Internal', members: 6, coach: 'Admin', locked: true },
];

interface ExerciseItem {
  id: string;
  name: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  mediaName: string;
  videoLink?: string;
}

const MAX_EXERCISE_MEDIA_SIZE_MB = 25;

interface AdminViewProps {
  currentPage: string;
  onCreateCoach: (payload: { name: string; email: string; password: string }) => { success: boolean; message: string };
  onCreateAthleteProfile: (payload: { name: string; email: string; sport: string }) => { success: boolean; message: string };
  athletes: Array<{ id: string; name: string; email: string; sport: string; createdBy: "admin" | "self" }>;
  coaches: Array<{ id: string; name: string; email: string }>;
  journalEntries: JournalEntry[];
}

export function AdminView({ currentPage, onCreateCoach, onCreateAthleteProfile, athletes, coaches, journalEntries }: AdminViewProps) {
  const [contractList, setContractList] = useState(contracts);
  const [requestList, setRequestList] = useState(customRequests);
  const [groupList, setGroupList] = useState(groups);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachPassword, setCoachPassword] = useState("");
  const [athleteName, setAthleteName] = useState("");
  const [athleteEmail, setAthleteEmail] = useState("");
  const [athleteSport, setAthleteSport] = useState("");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [newExerciseVideoLink, setNewExerciseVideoLink] = useState("");
  const [newExerciseMediaFile, setNewExerciseMediaFile] = useState<File | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [athleteSearch, setAthleteSearch] = useState("");
  const [selectedAthleteEmail, setSelectedAthleteEmail] = useState<string | null>(null);
  const [newProgram, setNewProgram] = useState("");
  const [exerciseList, setExerciseList] = useState<ExerciseItem[]>([
    {
      id: "exercise-001",
      name: "Barbell Squat",
      description: "Stand with shoulder-width stance, brace core, descend to parallel, and drive up.",
      mediaUrl: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=800&q=80",
      mediaType: "image",
      mediaName: "barbell-squat-demo.jpg",
      videoLink: "https://www.youtube.com/watch?v=bEv6CCg2BC8",
    },
    {
      id: "exercise-002",
      name: "Romanian Deadlift",
      description: "Hinge from the hips, keep neutral spine, and lower bar until hamstrings are loaded.",
      mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      mediaType: "video",
      mediaName: "romanian-deadlift-demo.mp4",
      videoLink: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
    },
    {
      id: "exercise-003",
      name: "Incline DB Press",
      description: "Press dumbbells up from a 30-degree bench while controlling the descent.",
      mediaUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=800&q=80",
      mediaType: "image",
      mediaName: "incline-dumbbell-press.jpg",
    },
    {
      id: "exercise-004",
      name: "Sprint Mechanics Drills",
      description: "A-skip and wall drill sequence to improve knee drive and sprint posture.",
      mediaUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      mediaType: "image",
      mediaName: "sprint-mechanics.jpg",
    },
  ]);
  const [programList, setProgramList] = useState<string[]>([
    "Elite Strength",
    "Recovery & Mobility",
    "Sprint Mechanics",
  ]);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const approveContract = (id: string) => setContractList(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
  const rejectContract = (id: string) => setContractList(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
  const approveRequest = (id: string) => setRequestList(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  const rejectRequest = (id: string) => setRequestList(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  const toggleLock = (id: number) => setGroupList(prev => prev.map(g => g.id === id ? { ...g, locked: !g.locked } : g));
  const adminCreatedAthleteProfiles = athletes.filter((athlete) => athlete.createdBy === "admin").length;

  const submitCoachCreation = (event: FormEvent) => {
    event.preventDefault();
    const result = onCreateCoach({
      name: coachName.trim(),
      email: coachEmail.trim(),
      password: coachPassword,
    });
    setFeedback(result);
    if (!result.success) return;
    setCoachName("");
    setCoachEmail("");
    setCoachPassword("");
  };

  const submitAthleteProfileCreation = (event: FormEvent) => {
    event.preventDefault();
    const result = onCreateAthleteProfile({
      name: athleteName.trim(),
      email: athleteEmail.trim(),
      sport: athleteSport.trim(),
    });
    setFeedback(result);
    if (!result.success) return;
    setAthleteName("");
    setAthleteEmail("");
    setAthleteSport("");
  };

  const submitExerciseCreation = (event: FormEvent) => {
    event.preventDefault();
    const name = newExerciseName.trim();
    const description = newExerciseDescription.trim();
    const isEditing = Boolean(editingExerciseId);
    if (!name || !description || (!newExerciseMediaFile && !isEditing)) {
      setFeedback({ success: false, message: "Name, description, and exercise image/video are required." });
      return;
    }
    if (newExerciseVideoLink.trim()) {
      const looksLikeUrl = /^https?:\/\/\S+$/i.test(newExerciseVideoLink.trim());
      if (!looksLikeUrl) {
        setFeedback({ success: false, message: "Video link must be a valid URL starting with http:// or https://." });
        return;
      }
    }
    if (exerciseList.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingExerciseId)) {
      setFeedback({ success: false, message: "Exercise already exists." });
      return;
    }

    if (editingExerciseId) {
      setExerciseList((previous) =>
        previous.map((item) => {
          if (item.id !== editingExerciseId) return item;
          if (!newExerciseMediaFile) {
            return {
              ...item,
              name,
              description,
              videoLink: newExerciseVideoLink.trim() || undefined,
            };
          }
          return {
            ...item,
            name,
            description,
            mediaUrl: URL.createObjectURL(newExerciseMediaFile),
            mediaType: newExerciseMediaFile.type.startsWith("video/") ? "video" : "image",
            mediaName: newExerciseMediaFile.name,
            videoLink: newExerciseVideoLink.trim() || undefined,
          };
        })
      );
      setSelectedExerciseId(editingExerciseId);
      setFeedback({ success: true, message: `Exercise updated: ${name}.` });
    } else {
      const mediaType = newExerciseMediaFile!.type.startsWith("video/") ? "video" : "image";
      const createdExercise: ExerciseItem = {
        id: `exercise-${Date.now()}`,
        name,
        description,
        mediaUrl: URL.createObjectURL(newExerciseMediaFile!),
        mediaType,
        mediaName: newExerciseMediaFile!.name,
        videoLink: newExerciseVideoLink.trim() || undefined,
      };
      setExerciseList((previous) => [createdExercise, ...previous]);
      setSelectedExerciseId(createdExercise.id);
      setFeedback({ success: true, message: `Exercise added: ${name}.` });
    }

    setNewExerciseName("");
    setNewExerciseDescription("");
    setNewExerciseVideoLink("");
    setNewExerciseMediaFile(null);
    setEditingExerciseId(null);
    setShowExerciseForm(false);
  };

  const submitProgramCreation = (event: FormEvent) => {
    event.preventDefault();
    const label = newProgram.trim();
    if (!label) return;
    if (programList.some((item) => item.toLowerCase() === label.toLowerCase())) {
      setFeedback({ success: false, message: "Program already exists." });
      return;
    }
    setProgramList((previous) => [...previous, label]);
    setNewProgram("");
    setFeedback({ success: true, message: `Program added: ${label}.` });
  };

  const statusColor = (s: string) => {
    if (s === 'Approved') return 'text-[#4ade80] border-[#4ade80]/30';
    if (s === 'Rejected') return 'text-destructive border-destructive/30';
    if (s === 'In Review') return 'text-[#60a5fa] border-[#60a5fa]/30';
    return 'text-[#ff8c42] border-[#ff8c42]/30';
  };

  const filteredAthletes = athletes.filter((athlete) =>
    `${athlete.name} ${athlete.email} ${athlete.sport}`.toLowerCase().includes(athleteSearch.toLowerCase())
  );
  const selectedAthlete = athletes.find((athlete) => athlete.email.toLowerCase() === (selectedAthleteEmail ?? "").toLowerCase()) ?? null;
  const selectedAthleteJournals = selectedAthlete
    ? journalEntries.filter((entry) => entry.athleteEmail.toLowerCase() === selectedAthlete.email.toLowerCase())
    : [];
  const selectedExercise = exerciseList.find((exercise) => exercise.id === selectedExerciseId) ?? null;

  const handleExerciseMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setNewExerciseMediaFile(null);
      return;
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setFeedback({ success: false, message: "Exercise media must be an image or video file." });
      return;
    }
    if (file.size > MAX_EXERCISE_MEDIA_SIZE_MB * 1024 * 1024) {
      setFeedback({ success: false, message: `Exercise media must be ${MAX_EXERCISE_MEDIA_SIZE_MB}MB or smaller.` });
      return;
    }
    setNewExerciseMediaFile(file);
    setFeedback(null);
  };

  const openExerciseCreateForm = () => {
    setEditingExerciseId(null);
    setNewExerciseName("");
    setNewExerciseDescription("");
    setNewExerciseVideoLink("");
    setNewExerciseMediaFile(null);
    setShowExerciseForm(true);
  };

  const openExerciseEditForm = (exercise: ExerciseItem) => {
    setEditingExerciseId(exercise.id);
    setNewExerciseName(exercise.name);
    setNewExerciseDescription(exercise.description);
    setNewExerciseVideoLink(exercise.videoLink ?? "");
    setNewExerciseMediaFile(null);
    setShowExerciseForm(true);
  };

  const cancelExerciseForm = () => {
    setShowExerciseForm(false);
    setEditingExerciseId(null);
    setNewExerciseName("");
    setNewExerciseDescription("");
    setNewExerciseVideoLink("");
    setNewExerciseMediaFile(null);
  };

  const deleteExercise = (exerciseId: string) => {
    setExerciseList((previous) => previous.filter((item) => item.id !== exerciseId));
    if (selectedExerciseId === exerciseId) setSelectedExerciseId(null);
    if (editingExerciseId === exerciseId) cancelExerciseForm();
    setFeedback({ success: true, message: "Exercise deleted." });
  };

  if (currentPage === 'admin-dashboard') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>ADMINISTRATION</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            ADMIN<br /><span className="text-[#a78bfa]">OVERVIEW</span>
          </h1>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pending Contracts', value: contractList.filter(c => c.status === 'Pending').length.toString(), color: '#ff8c42', sub: 'awaiting approval' },
            { label: 'Custom Requests', value: requestList.filter(r => r.status === 'Pending' || r.status === 'In Review').length.toString(), color: '#60a5fa', sub: 'in pipeline' },
              { label: 'Total Athletes', value: athletes.length.toString(), color: '#4ade80', sub: 'accounts with profiles' },
              { label: 'Coach Logins', value: coaches.length.toString(), color: '#a78bfa', sub: 'admin provisioned' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border p-4">
              <div className="text-muted-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5">
            <div className="text-muted-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Recent Contracts</div>
            <div className="space-y-2.5">
              {contractList.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>{c.athlete}</div>
                    <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{c.id} · {c.signed}</div>
                  </div>
                  <span className={`px-2 py-0.5 border uppercase ${statusColor(c.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border p-5">
            <div className="text-muted-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Custom Requests Queue</div>
            <div className="space-y-2.5">
              {requestList.map(r => (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>{r.athlete}</div>
                    <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{r.id} · {r.submitted}</div>
                  </div>
                  <span className={`px-2 py-0.5 border uppercase ${statusColor(r.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5">
            <div className="text-muted-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>
              Management Modules
            </div>
            <div className="space-y-2">
              {[
                `Coaches: ${coaches.length} login accounts`,
                `Athletes: ${athletes.length} profiles`,
                `Exercises: ${exerciseList.length} tracked items`,
                `Programs: ${programList.length} active templates`,
              ].map((item) => (
                <div key={item} className="border border-border px-3 py-2 text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border p-5">
            <div className="text-muted-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>
              Access Rules
            </div>
            <div className="space-y-2 text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              <p>Coach logins are provisioned only from the Coaches module.</p>
              <p>Athlete profiles are created from the Athletes module.</p>
              <p>Exercises and Programs can be managed from their dedicated modules.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin-coaches') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>COACH MANAGEMENT</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            COACH<br /><span className="text-[#60a5fa]">MODULE</span>
          </h1>
        </div>
        <form onSubmit={submitCoachCreation} className="bg-card border border-border p-5 space-y-3">
          <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
            Create Coach Login
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <input
              required
              value={coachName}
              onChange={(event) => setCoachName(event.target.value)}
              placeholder="Coach full name"
              className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
            />
            <input
              required
              type="email"
              value={coachEmail}
              onChange={(event) => setCoachEmail(event.target.value)}
              placeholder="Coach email"
              className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
            />
            <input
              required
              type="password"
              minLength={6}
              value={coachPassword}
              onChange={(event) => setCoachPassword(event.target.value)}
              placeholder="Temporary password"
              className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#60a5fa]/10 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/20 transition-all cursor-pointer uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            Provision Coach Credentials
          </button>
        </form>
        <div className="bg-card border border-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
              All Coaches
            </h2>
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>
              Total: {coaches.length}
            </span>
          </div>
          <div className="space-y-2 mt-4">
            {coaches.map((coach) => (
              <div key={coach.id} className="flex items-center justify-between border border-border px-3 py-2">
                <div>
                  <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.86rem' }}>
                    {coach.name}
                  </div>
                  <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                    {coach.email}
                  </div>
                </div>
                <span className="uppercase border px-2 py-0.5 text-[#60a5fa] border-[#60a5fa]/30" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.08em' }}>
                  Coach
                </span>
              </div>
            ))}
          </div>
        </div>
        {feedback && (
          <div className={`border px-4 py-2 ${feedback.success ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10" : "border-destructive/30 text-destructive bg-destructive/10"}`} style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
            {feedback.message}
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'admin-athletes') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>ATHLETE MANAGEMENT</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            ATHLETE<br /><span className="text-[#4ade80]">MODULE</span>
          </h1>
        </div>
        <form onSubmit={submitAthleteProfileCreation} className="bg-card border border-border p-5 space-y-3">
          <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
            Create Athlete Profile
          </h2>
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem' }}>
            Athlete must first create an account from the login page.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <input
              required
              value={athleteName}
              onChange={(event) => setAthleteName(event.target.value)}
              placeholder="Athlete full name"
              className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
            />
            <input
              required
              type="email"
              value={athleteEmail}
              onChange={(event) => setAthleteEmail(event.target.value)}
              placeholder="Athlete account email"
              className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
            />
            <input
              required
              value={athleteSport}
              onChange={(event) => setAthleteSport(event.target.value)}
              placeholder="Sport"
              className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            Create Athlete Profile
          </button>
        </form>
        <div className="bg-card border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
              All Athlete Profiles
            </h2>
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>
              Admin created: {adminCreatedAthleteProfiles} / Total: {athletes.length}
            </span>
          </div>
          <input
            value={athleteSearch}
            onChange={(event) => setAthleteSearch(event.target.value)}
            placeholder="Search athlete by name, sport, or email..."
            className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
          />
          <div className="space-y-2 mt-4">
            {filteredAthletes.map((athlete) => (
              <div key={athlete.id} className="flex items-center justify-between border border-border px-3 py-2">
                <div>
                  <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.86rem' }}>
                    {athlete.name}
                  </div>
                  <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                    {athlete.email} · {athlete.sport}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAthleteEmail(athlete.email)}
                    className="px-3 py-1.5 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-all cursor-pointer uppercase"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.06em' }}
                  >
                    View Athlete Journals
                  </button>
                  <span
                    className={`uppercase border px-2 py-0.5 ${athlete.createdBy === "admin" ? "text-[#a78bfa] border-[#a78bfa]/30" : "text-[#60a5fa] border-[#60a5fa]/30"}`}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '0.08em' }}
                  >
                    {athlete.createdBy === "admin" ? "Admin Created" : "Self Signup"}
                  </span>
                </div>
              </div>
            ))}
            {filteredAthletes.length === 0 && (
              <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                No athletes found for the current search.
              </div>
            )}
          </div>
        </div>
        {selectedAthlete && (
          <div className="bg-card border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
                  {selectedAthlete.name} · Journal Entries
                </h3>
                <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                  {selectedAthlete.email} · {selectedAthlete.sport}
                </div>
              </div>
              <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                {selectedAthleteJournals.length} entries
              </span>
            </div>
            <div className="space-y-3">
              {selectedAthleteJournals.length === 0 && (
                <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                  This athlete has no journal entries yet.
                </div>
              )}
              {selectedAthleteJournals.map((entry) => (
                <div key={entry.id} className="border border-border p-4 space-y-3">
                  <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}>
                    {entry.createdAt}
                  </div>
                  {entry.text && (
                    <p className="text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                      {entry.text}
                    </p>
                  )}
                  {entry.media.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {entry.media.map((media) => (
                        <div key={media.id} className="border border-border bg-secondary/30 p-2">
                          <div className="text-muted-foreground mb-1 truncate" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem' }}>
                            {media.name}
                          </div>
                          {media.type === "image" && <img src={media.url} alt={media.name} className="w-full h-28 object-cover border border-border" />}
                          {media.type === "video" && <video src={media.url} controls className="w-full h-28 object-cover border border-border" />}
                          {media.type === "audio" && <audio src={media.url} controls className="w-full h-8" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {feedback && (
          <div className={`border px-4 py-2 ${feedback.success ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10" : "border-destructive/30 text-destructive bg-destructive/10"}`} style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
            {feedback.message}
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'admin-exercises') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>EXERCISE LIBRARY</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            EXERCISE<br /><span className="text-[#ff8c42]">MODULE</span>
          </h1>
        </div>
        <div className="bg-card border border-border p-5 space-y-3">
          <button
            onClick={() => (showExerciseForm ? cancelExerciseForm() : openExerciseCreateForm())}
            className="px-4 py-2 bg-[#ff8c42]/10 border border-[#ff8c42]/30 text-[#ff8c42] hover:bg-[#ff8c42]/20 transition-all cursor-pointer uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}
          >
            {showExerciseForm ? "Close Exercise Form" : "Add Exercise"}
          </button>
          {showExerciseForm && (
            <form onSubmit={submitExerciseCreation} className="space-y-3 border-t border-border pt-3">
              <h2 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
                {editingExerciseId ? "Edit Exercise" : "Add Exercise"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  value={newExerciseName}
                  onChange={(event) => setNewExerciseName(event.target.value)}
                  placeholder="Exercise name"
                  className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
                />
                <input
                  value={newExerciseVideoLink}
                  onChange={(event) => setNewExerciseVideoLink(event.target.value)}
                  placeholder="Optional video link (YouTube/Vimeo)"
                  className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
                />
              </div>
              <textarea
                required
                value={newExerciseDescription}
                onChange={(event) => setNewExerciseDescription(event.target.value)}
                placeholder="Exercise description and coaching cues..."
                className="w-full min-h-20 bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none resize-y"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5 }}
              />
              <label className="block border border-border bg-secondary/40 p-3 cursor-pointer hover:bg-secondary/70 transition-all">
                <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                  Upload Exercise Media (Image or Video)
                </div>
                <input
                  required={!editingExerciseId}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleExerciseMediaChange}
                />
                <div className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}>
                  {newExerciseMediaFile ? newExerciseMediaFile.name : editingExerciseId ? "Keep current media or upload new file" : "No file selected"}
                </div>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-[#ff8c42]/10 border border-[#ff8c42]/30 text-[#ff8c42] hover:bg-[#ff8c42]/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                  {editingExerciseId ? "Update Exercise" : "Add Exercise"}
                </button>
                <button
                  type="button"
                  onClick={cancelExerciseForm}
                  className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer uppercase"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5">
            <div className="text-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
              All Exercises
            </div>
            <div className="space-y-2">
              {exerciseList.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`w-full border px-3 py-2 transition-all ${selectedExerciseId === exercise.id ? "border-[#ff8c42]/40 bg-[#ff8c42]/10" : "border-border hover:border-[#ff8c42]/30"}`}
                >
                  <button onClick={() => setSelectedExerciseId(exercise.id)} className="w-full text-left cursor-pointer">
                    <div className="text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                      {String(index + 1).padStart(2, "0")} · {exercise.name}
                    </div>
                    <div className="text-muted-foreground mt-1 truncate" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem' }}>
                      {exercise.mediaType.toUpperCase()} · {exercise.mediaName}
                    </div>
                  </button>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                    <button
                      onClick={() => openExerciseEditForm(exercise)}
                      className="px-2.5 py-1 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-all cursor-pointer uppercase"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteExercise(exercise.id)}
                      className="px-2.5 py-1 border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all cursor-pointer uppercase"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border p-5">
            <div className="text-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
              Exercise Detail
            </div>
            {!selectedExercise && (
              <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                Select an exercise to view its image/video demonstration.
              </div>
            )}
            {selectedExercise && (
              <div className="space-y-3">
                <h3 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', letterSpacing: '0.04em' }}>
                  {selectedExercise.name}
                </h3>
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {selectedExercise.description}
                </p>
                {selectedExercise.mediaType === "image" ? (
                  <img src={selectedExercise.mediaUrl} alt={selectedExercise.name} className="w-full h-44 object-cover border border-border" />
                ) : (
                  <video src={selectedExercise.mediaUrl} controls className="w-full h-44 object-cover border border-border" />
                )}
                {selectedExercise.videoLink && (
                  <a
                    href={selectedExercise.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-3 py-1.5 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-all uppercase"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em' }}
                  >
                    Open Video Link
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        {feedback && (
          <div className={`border px-4 py-2 ${feedback.success ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10" : "border-destructive/30 text-destructive bg-destructive/10"}`} style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
            {feedback.message}
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'admin-programs') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>PROGRAM LIBRARY</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            PROGRAM<br /><span className="text-[#a78bfa]">MODULE</span>
          </h1>
        </div>
        <form onSubmit={submitProgramCreation} className="bg-card border border-border p-5 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>
              New Program
            </label>
            <input
              required
              value={newProgram}
              onChange={(event) => setNewProgram(event.target.value)}
              placeholder="e.g. Offseason Explosive Power"
              className="w-full bg-secondary border border-border px-3 py-2 text-foreground focus:outline-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}>
            Add Program
          </button>
        </form>
        <div className="bg-card border border-border p-5">
          <div className="text-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
            All Programs
          </div>
          <div className="space-y-2">
            {programList.map((program, index) => (
              <div key={program} className="border border-border px-3 py-2 text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                {String(index + 1).padStart(2, "0")} · {program}
              </div>
            ))}
          </div>
        </div>
        {feedback && (
          <div className={`border px-4 py-2 ${feedback.success ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10" : "border-destructive/30 text-destructive bg-destructive/10"}`} style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
            {feedback.message}
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'admin-messages') {
    return <AdminMessaging coaches={coaches} athletes={athletes} />;
  }

  if (currentPage === 'admin-contracts') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>CONTRACT MANAGEMENT</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            ENROLLMENT<br /><span className="text-[#a78bfa]">CONTRACTS</span>
          </h1>
        </div>
        <div className="space-y-2">
          {contractList.map(c => (
            <div key={c.id} className="bg-card border border-border p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <FileText size={20} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>{c.id}</span>
                      <span className={`px-2 py-0.5 border uppercase ${statusColor(c.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{c.status}</span>
                    </div>
                    <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.04em' }}>{c.athlete}</div>
                    <div className="text-muted-foreground mt-0.5 break-words" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
                      {c.program} · {c.coach} · {c.type} · {c.duration} · {c.amount}
                    </div>
                    <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>Signed: {c.signed}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer uppercase whitespace-nowrap" style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    <Eye size={12} /> View
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer uppercase whitespace-nowrap" style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    <Download size={12} /> PDF
                  </button>
                  {c.status === 'Pending' && (
                    <>
                      <button onClick={() => approveContract(c.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer uppercase whitespace-nowrap" style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        <Check size={12} /> Approve
                      </button>
                      <button onClick={() => rejectContract(c.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all cursor-pointer uppercase whitespace-nowrap" style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        <X size={12} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentPage === 'admin-requests') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>CUSTOM PROGRAMS</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            PROGRAM<br /><span className="text-[#a78bfa]">REQUESTS</span>
          </h1>
        </div>
        <div className="space-y-3">
          {requestList.map(r => {
            const open = expandedRequest === r.id;
            return (
              <div key={r.id} className="bg-card border border-border">
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted transition-all" onClick={() => setExpandedRequest(open ? null : r.id)}>
                  <AlertCircle size={18} className={r.status === 'Pending' ? 'text-[#ff8c42]' : r.status === 'In Review' ? 'text-[#60a5fa]' : r.status === 'Approved' ? 'text-[#4ade80]' : 'text-destructive'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em' }}>{r.athlete}</span>
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{r.id}</span>
                    </div>
                    <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>{r.goal.slice(0, 70)}...</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}><Clock size={11} /> {r.submitted}</span>
                    <span className={`px-2 py-0.5 border uppercase ${statusColor(r.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{r.status}</span>
                    <span className="text-muted-foreground">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>
                </div>
                {open && (
                  <div className="border-t border-border px-5 py-4 bg-muted space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ['Goal', r.goal],
                        ['Level', r.level],
                        ['Equipment', r.equipment],
                        ['Time Available', r.time],
                        ['Injury / Medical', r.injury],
                      ].map(([label, val]) => (
                        <div key={label} className={label === 'Goal' ? 'col-span-2' : ''}>
                          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>{label}</div>
                          <div className="text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {(r.status === 'Pending' || r.status === 'In Review') && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button onClick={() => approveRequest(r.id)} className="flex items-center gap-1.5 px-4 py-2 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                          <Check size={14} /> Approve & Assign Coach
                        </button>
                        <button onClick={() => rejectRequest(r.id)} className="flex items-center gap-1.5 px-4 py-2 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentPage === 'admin-groups') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>GROUP MANAGEMENT</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            CHAT<br /><span className="text-[#a78bfa]">GROUPS</span>
          </h1>
        </div>
        <div className="space-y-2">
          {groupList.map(g => (
            <div key={g.id} className="bg-card border border-border p-5 flex items-center gap-4">
              <ShieldCheck size={20} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em' }}>{g.name}</span>
                  <span className="text-muted-foreground border border-border px-2 py-0.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{g.type}</span>
                  {g.locked && <span className="text-destructive border border-destructive/30 px-2 py-0.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>Locked</span>}
                </div>
                <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>
                  <Users size={11} className="inline mr-1" />{g.members} members · Coach: {g.coach}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                  View
                </button>
                <button
                  onClick={() => toggleLock(g.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer uppercase ${g.locked ? 'border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10 hover:bg-[#4ade80]/20' : 'border-[#ff8c42]/30 text-[#ff8c42] bg-[#ff8c42]/10 hover:bg-[#ff8c42]/20'}`}
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}
                >
                  {g.locked ? <><Unlock size={13} /> Unlock</> : <><Lock size={13} /> Lock</>}
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
