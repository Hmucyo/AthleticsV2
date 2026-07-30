export interface ExerciseItem {
  id: string;
  name: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  mediaName: string;
  videoLink?: string;
  /** When true, athletes are encouraged to log the load they used. */
  requiresWeights: boolean;
}

export interface ProgramItem {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface AthleteExerciseAssignment {
  id: string;
  athleteEmail: string;
  athleteName: string;
  exerciseId: string;
  scheduledDate: string; // YYYY-MM-DD
  completed: boolean;
  assignedAt: string;
  /** Optional load the athlete logged for this assignment (e.g. "185"). */
  loggedWeight?: string;
  weightUnit?: "lbs" | "kg";
}

export interface TrainingState {
  exercises: ExerciseItem[];
  programs: ProgramItem[];
  assignments: AthleteExerciseAssignment[];
}

const STORAGE_KEY = "afsp-training-v1";

export const defaultExercises: ExerciseItem[] = [
  {
    id: "exercise-001",
    name: "Barbell Squat",
    description: "Stand with shoulder-width stance, brace core, descend to parallel, and drive up.",
    mediaUrl: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    mediaName: "barbell-squat-demo.jpg",
    videoLink: "https://www.youtube.com/watch?v=bEv6CCg2BC8",
    requiresWeights: true,
  },
  {
    id: "exercise-002",
    name: "Romanian Deadlift",
    description: "Hinge from the hips, keep neutral spine, and lower bar until hamstrings are loaded.",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    mediaType: "video",
    mediaName: "romanian-deadlift-demo.mp4",
    videoLink: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
    requiresWeights: true,
  },
  {
    id: "exercise-003",
    name: "Incline DB Press",
    description: "Press dumbbells up from a 30-degree bench while controlling the descent.",
    mediaUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    mediaName: "incline-dumbbell-press.jpg",
    requiresWeights: true,
  },
  {
    id: "exercise-004",
    name: "Sprint Mechanics Drills",
    description: "A-skip and wall drill sequence to improve knee drive and sprint posture.",
    mediaUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    mediaType: "image",
    mediaName: "sprint-mechanics.jpg",
    requiresWeights: false,
  },
];

export const defaultPrograms: ProgramItem[] = [
  { id: "program-001", name: "Elite Strength", exerciseIds: ["exercise-001", "exercise-002", "exercise-003"] },
  { id: "program-002", name: "Recovery & Mobility", exerciseIds: [] },
  { id: "program-003", name: "Sprint Mechanics", exerciseIds: ["exercise-004"] },
];

export const defaultTrainingState: TrainingState = {
  exercises: defaultExercises,
  programs: defaultPrograms,
  assignments: [],
};

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function normalizeExercise(exercise: Partial<ExerciseItem> & { id: string; name: string }): ExerciseItem {
  const weightedName = /squat|deadlift|press|row|curl|bench|db |barbell|dumbbell|kettle/i.test(exercise.name);
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description ?? "",
    mediaUrl: exercise.mediaUrl ?? "",
    mediaType: exercise.mediaType === "video" ? "video" : "image",
    mediaName: exercise.mediaName ?? "media",
    videoLink: exercise.videoLink,
    requiresWeights: typeof exercise.requiresWeights === "boolean" ? exercise.requiresWeights : weightedName,
  };
}

export function loadTrainingState(): TrainingState {
  if (typeof window === "undefined") return defaultTrainingState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTrainingState;
    const parsed = JSON.parse(raw) as Partial<TrainingState>;
    const exercises =
      Array.isArray(parsed.exercises) && parsed.exercises.length > 0
        ? parsed.exercises.map((item) => normalizeExercise(item as ExerciseItem))
        : defaultExercises;
    return {
      exercises,
      programs: Array.isArray(parsed.programs) && parsed.programs.length > 0 ? parsed.programs : defaultPrograms,
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
    };
  } catch {
    return defaultTrainingState;
  }
}

export function saveTrainingState(state: TrainingState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
