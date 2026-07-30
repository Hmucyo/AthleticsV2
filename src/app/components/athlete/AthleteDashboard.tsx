// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  TrendingUp,
  Clock,
  Target,
  BarChart2,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import type { AthleteExerciseAssignment, ExerciseItem } from "../../../lib/training";
import { parseDateKey, toDateKey } from "../../../lib/training";
import "react-day-picker/dist/style.css";

type RangeMode = "week" | "month" | "3months" | "6months";
type WeightUnit = "lbs" | "kg";

const RANGE_OPTIONS: Array<{ id: RangeMode; label: string }> = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "3months", label: "3 Months" },
  { id: "6months", label: "6 Months" },
];

interface AthleteDashboardProps {
  athleteName?: string;
  athleteEmail: string;
  exercises: ExerciseItem[];
  assignments: AthleteExerciseAssignment[];
  onToggleAssignmentComplete: (assignmentId: string) => void;
  onUpdateAssignmentWeight: (assignmentId: string, loggedWeight: string, weightUnit: WeightUnit) => void;
}

function startOfWeek(date: Date): Date {
  const next = new Date(date);
  const day = next.getDay();
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function AthleteDashboard({
  athleteName = "Athlete",
  athleteEmail,
  exercises,
  assignments,
  onToggleAssignmentComplete,
  onUpdateAssignmentWeight,
}: AthleteDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [rangeMode, setRangeMode] = useState<RangeMode>("week");
  const [rangeMenuOpen, setRangeMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [weightNudgeId, setWeightNudgeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"workout" | "progress">("workout");
  const weekScrollerRef = useRef<HTMLDivElement>(null);

  const handleToggleComplete = (assignment: AthleteExerciseAssignment, exercise: ExerciseItem | undefined) => {
    const markingComplete = !assignment.completed;
    if (
      markingComplete &&
      exercise?.requiresWeights &&
      !assignment.loggedWeight?.trim()
    ) {
      setExpanded(assignment.id);
      setWeightNudgeId(assignment.id);
    } else if (weightNudgeId === assignment.id) {
      setWeightNudgeId(null);
    }
    onToggleAssignmentComplete(assignment.id);
  };

  const selectedDateKey = toDateKey(selectedDate);
  const todayKey = toDateKey(new Date());
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const isCurrentWeek = toDateKey(weekStart) === toDateKey(startOfWeek(new Date()));
  const rangeLabel = useMemo(() => {
    if (rangeMode !== "week") {
      return RANGE_OPTIONS.find((option) => option.id === rangeMode)?.label ?? "This Week";
    }
    if (isCurrentWeek) return "This Week";
    return weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }, [isCurrentWeek, rangeMode, weekStart]);

  const exerciseById = useMemo(() => {
    const map = new Map<string, ExerciseItem>();
    exercises.forEach((exercise) => map.set(exercise.id, exercise));
    return map;
  }, [exercises]);

  const daysWithWorkouts = useMemo(() => {
    return new Set(assignments.map((item) => item.scheduledDate));
  }, [assignments]);

  const dayAssignments = useMemo(
    () =>
      assignments
        .filter((item) => item.scheduledDate === selectedDateKey)
        .map((item) => ({
          assignment: item,
          exercise: exerciseById.get(item.exerciseId),
        }))
        .filter((item) => item.exercise),
    [assignments, exerciseById, selectedDateKey]
  );

  const upcomingDays = useMemo(() => {
    const grouped = new Map<string, number>();
    assignments.forEach((item) => {
      grouped.set(item.scheduledDate, (grouped.get(item.scheduledDate) ?? 0) + 1);
    });
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([date]) => date >= todayKey)
      .slice(0, 8)
      .map(([date, count]) => ({
        date,
        count,
        completed: assignments.filter((item) => item.scheduledDate === date && item.completed).length,
      }));
  }, [assignments, todayKey]);

  const weekStrip = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      const key = toDateKey(date);
      const count = assignments.filter((item) => item.scheduledDate === key).length;
      const completed = assignments.filter((item) => item.scheduledDate === key && item.completed).length;
      return { date, key, count, completed, label: date.toLocaleDateString(undefined, { weekday: "short" }) };
    });
  }, [assignments, selectedDate]);

  const calendarMonthCount = rangeMode === "month" ? 1 : rangeMode === "3months" ? 3 : 6;
  const calendarFromMonth = useMemo(() => startOfMonth(new Date()), []);
  const calendarToMonth = useMemo(() => {
    const base = startOfMonth(new Date());
    return new Date(base.getFullYear(), base.getMonth() + calendarMonthCount - 1, 1);
  }, [calendarMonthCount]);

  const weeklyChart = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      const key = toDateKey(date);
      const dayItems = assignments.filter((item) => item.scheduledDate === key);
      const completed = dayItems.filter((item) => item.completed).length;
      return {
        day: date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
        assigned: dayItems.length,
        completed,
        load: dayItems.length === 0 ? 0 : Math.round((completed / dayItems.length) * 100),
      };
    });
  }, [assignments]);

  const completedCount = dayAssignments.filter((item) => item.assignment.completed).length;
  const pct = dayAssignments.length === 0 ? 0 : Math.round((completedCount / dayAssignments.length) * 100);
  const totalAssigned = assignments.length;
  const totalCompleted = assignments.filter((item) => item.completed).length;
  const overallPct = totalAssigned === 0 ? 0 : Math.round((totalCompleted / totalAssigned) * 100);
  const completionRing = [
    { name: "Progress", value: overallPct, fill: "#ff5500" },
    { name: "Remaining", value: Math.max(0, 100 - overallPct), fill: "#1e2225" },
  ];

  const todayLabel = selectedDate
    .toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const jumpToNextWorkout = () => {
    const next = upcomingDays.find((item) => item.date >= todayKey);
    if (!next) return;
    setSelectedDate(parseDateKey(next.date));
    setActiveTab("workout");
  };

  const shiftWeek = (direction: -1 | 1) => {
    setSelectedDate((previous) => addDays(startOfWeek(previous), direction * 7));
  };

  const selectDayFromCalendar = (date: Date) => {
    setSelectedDate(date);
    setRangeMode("week");
    setRangeMenuOpen(false);
  };

  useEffect(() => {
    const scroller = weekScrollerRef.current;
    if (!scroller) return;
    const selectedButton = scroller.querySelector<HTMLElement>(`[data-day-key="${selectedDateKey}"]`);
    selectedButton?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedDateKey]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
      <div className="border border-[#ff8c42]/40 bg-[#ff8c42]/10 px-3 py-2 text-[#ff8c42]" style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}>
        Welcome, {athleteName}. Your calendar shows days an admin has assigned exercises to you.
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em" }}>
            {todayLabel}
          </div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, lineHeight: 1, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            DAILY<br />
            <span className="text-primary">TRAINING</span>
          </h1>
          <div className="text-muted-foreground mt-1.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
            {totalAssigned === 0
              ? "No exercises assigned yet"
              : `${totalCompleted}/${totalAssigned} assigned exercises completed`}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("workout")}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === "workout" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-foreground"}`}
            style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Training
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`px-4 py-2 border transition-all cursor-pointer ${activeTab === "progress" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:text-foreground"}`}
            style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Progress
          </button>
        </div>
      </div>

      {activeTab === "workout" && (
        <>
          <div className="bg-card border border-border p-3 space-y-3">
            <div className="relative flex items-center justify-between gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRangeMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-foreground hover:border-[#ff8c42]/40 transition-all cursor-pointer uppercase"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em" }}
                >
                  {rangeLabel}
                  <ChevronDown size={14} className={`transition-transform ${rangeMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {rangeMenuOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 min-w-[11rem] border border-border bg-card shadow-lg">
                    {RANGE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setRangeMode(option.id);
                          setRangeMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 uppercase transition-all cursor-pointer ${
                          rangeMode === option.id
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em" }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date())}
                  className="px-2.5 py-1.5 border border-border text-muted-foreground hover:text-foreground cursor-pointer uppercase"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em" }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={jumpToNextWorkout}
                  className="px-2.5 py-1.5 border border-[#ff8c42]/30 text-[#ff8c42] hover:bg-[#ff8c42]/10 cursor-pointer uppercase"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em" }}
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => shiftWeek(-1)}
                  className="p-1.5 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Previous week"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => shiftWeek(1)}
                  className="p-1.5 border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Next week"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={weekScrollerRef}
              className="flex gap-2 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory"
            >
              {weekStrip.map((day) => {
                const selected = day.key === selectedDateKey;
                const isToday = day.key === todayKey;
                return (
                  <button
                    key={day.key}
                    type="button"
                    data-day-key={day.key}
                    onClick={() => setSelectedDate(day.date)}
                    className={`min-w-[4.5rem] flex-shrink-0 snap-center border px-2 py-2 transition-all cursor-pointer ${
                      selected
                        ? "border-primary bg-primary/20 text-foreground"
                        : day.count > 0
                          ? "border-[#ff8c42]/35 bg-[#ff8c42]/10 text-[#ff8c42]"
                          : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.08em" }}>{day.label}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem" }}>{day.date.getDate()}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem" }}>
                      {day.count === 0 ? (isToday ? "—" : "·") : `${day.completed}/${day.count}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {rangeMode !== "week" && (
              <div className="border border-border bg-secondary/20 p-3 overflow-x-auto">
                <div className="text-muted-foreground uppercase mb-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                  Select a day — the week strip above will jump to that week
                </div>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && selectDayFromCalendar(date)}
                  numberOfMonths={calendarMonthCount}
                  fromMonth={calendarFromMonth}
                  toMonth={calendarToMonth}
                  modifiers={{
                    hasWorkout: (date) => daysWithWorkouts.has(toDateKey(date)),
                  }}
                  modifiersClassNames={{
                    hasWorkout: "rdp-day-has-workout",
                  }}
                  className="athlete-range-picker text-foreground"
                />
                <style>{`
                  .athlete-range-picker .rdp {
                    --rdp-cell-size: 34px;
                    --rdp-accent-color: #ff5500;
                    --rdp-background-color: rgba(255, 85, 0, 0.2);
                    margin: 0;
                  }
                  .athlete-range-picker .rdp-months {
                    flex-wrap: wrap;
                    justify-content: flex-start;
                    gap: 1rem;
                  }
                  .athlete-range-picker .rdp-day_selected:not([disabled]),
                  .athlete-range-picker .rdp-day_selected:focus:not([disabled]),
                  .athlete-range-picker .rdp-day_selected:hover:not([disabled]) {
                    background-color: #ff5500;
                    color: white;
                  }
                  .athlete-range-picker .rdp-day-has-workout:not([aria-selected="true"]) {
                    background: rgba(255, 85, 0, 0.18);
                    color: #ff8c42;
                    font-weight: 700;
                  }
                  .athlete-range-picker .rdp-caption_label,
                  .athlete-range-picker .rdp-head_cell,
                  .athlete-range-picker .rdp-day {
                    color: inherit;
                  }
                `}</style>
              </div>
            )}
          </div>

          <div className="space-y-4 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Completed", value: `${completedCount}/${dayAssignments.length}`, icon: <Target size={16} className="text-primary" />, sub: "day list" },
                { label: "Day", value: selectedDateKey.slice(5), icon: <Clock size={16} className="text-[#60a5fa]" />, sub: selectedDateKey },
                { label: "Assigned Days", value: String(daysWithWorkouts.size), icon: <TrendingUp size={16} className="text-[#4ade80]" />, sub: "on calendar" },
                { label: "Overall", value: `${overallPct}%`, icon: <Flame size={16} className="text-[#ff8c42]" />, sub: `${totalCompleted}/${totalAssigned} done` },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
                      {stat.label}
                    </span>
                    {stat.icon}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", lineHeight: 1, letterSpacing: "0.02em" }} className="text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground mt-0.5 truncate" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.06em" }}>
                  Session Progress
                </span>
                <span className="text-primary" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 500 }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-secondary">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-foreground uppercase mb-3" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.06em" }}>
                Exercises for {selectedDateKey}
              </h2>
              {dayAssignments.length === 0 && (
                <div className="bg-card border border-border p-5 text-muted-foreground space-y-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}>
                  <p>No exercises assigned for this day.</p>
                  <p className="text-muted-foreground/80" style={{ fontSize: "0.78rem" }}>
                    Ask an admin to Assign an exercise to <span className="text-foreground">{athleteEmail}</span> on a calendar day.
                  </p>
                </div>
              )}
              {dayAssignments.map(({ assignment, exercise }, idx) => {
                if (!exercise) return null;
                const done = assignment.completed;
                const open = expanded === assignment.id;
                const weightUnit = assignment.weightUnit ?? "lbs";
                const hasWeight = Boolean(assignment.loggedWeight?.trim());
                const suggestWeight = Boolean(exercise.requiresWeights && !hasWeight);
                const nudgeWeight = weightNudgeId === assignment.id && suggestWeight;
                return (
                  <div
                    key={assignment.id}
                    className={`bg-card border transition-all ${done ? "border-[#ff5500]/30 opacity-70" : "border-border hover:border-[rgba(255,255,255,0.15)]"}`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 cursor-pointer" onClick={() => setExpanded(open ? null : assignment.id)}>
                      <span className="text-muted-foreground w-5 text-center flex-shrink-0" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleComplete(assignment, exercise);
                        }}
                        className={`flex-shrink-0 transition-colors cursor-pointer ${done ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        aria-label={done ? "Mark incomplete" : "Mark complete"}
                      >
                        {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`${done ? "line-through text-muted-foreground" : "text-foreground"} uppercase`} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.04em" }}>
                            {exercise.name}
                          </span>
                          {exercise.requiresWeights && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-[#ff8c42]/35 text-[#ff8c42]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.08em" }}>
                              <Dumbbell size={10} /> WEIGHTED
                            </span>
                          )}
                          {hasWeight && (
                            <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}>
                              {assignment.loggedWeight} {weightUnit}
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground mt-0.5 truncate" style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem" }}>
                          {exercise.description}
                        </div>
                      </div>
                      <span className="text-muted-foreground flex-shrink-0">{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    </div>
                    {open && (
                      <div className="border-t border-border px-3 sm:px-4 py-3 bg-muted space-y-3">
                        {exercise.mediaType === "image" ? (
                          <img src={exercise.mediaUrl} alt={exercise.name} className="w-full max-h-56 object-cover border border-border" />
                        ) : (
                          <video src={exercise.mediaUrl} controls className="w-full max-h-56 object-cover border border-border" />
                        )}
                        {exercise.videoLink && (
                          <a
                            href={exercise.videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block px-3 py-1.5 border border-[#60a5fa]/30 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-all uppercase"
                            style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em" }}
                          >
                            Open Video Link
                          </a>
                        )}
                        {exercise.requiresWeights && (
                          <div
                            className={`border p-3 space-y-2 transition-colors ${
                              nudgeWeight
                                ? "border-[#ff8c42] bg-[#ff8c42]/10"
                                : suggestWeight
                                  ? "border-[#ff8c42]/35 bg-[#ff8c42]/5"
                                  : "border-border bg-secondary/40"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <Dumbbell size={14} className="text-[#ff8c42] mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="text-foreground uppercase" style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em" }}>
                                  Weight used {suggestWeight ? "(suggested)" : ""}
                                </div>
                                <p className="text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", lineHeight: 1.45 }}>
                                  {nudgeWeight
                                    ? "Optional — log the load you used to track progress. You can still mark this complete without it."
                                    : "Log the load you used for this set. Optional, but helpful for progress tracking."}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="any"
                                value={assignment.loggedWeight ?? ""}
                                onChange={(event) => {
                                  const next = event.target.value;
                                  onUpdateAssignmentWeight(assignment.id, next, weightUnit);
                                  if (next.trim()) setWeightNudgeId(null);
                                }}
                                onFocus={() => setWeightNudgeId(null)}
                                placeholder="e.g. 185"
                                className="flex-1 min-w-0 bg-background border border-border px-3 py-2 text-foreground focus:outline-none focus:border-[#ff8c42]/50"
                                style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
                              />
                              <div className="flex border border-border">
                                {(["lbs", "kg"] as WeightUnit[]).map((unit) => (
                                  <button
                                    key={unit}
                                    type="button"
                                    onClick={() => onUpdateAssignmentWeight(assignment.id, assignment.loggedWeight ?? "", unit)}
                                    className={`px-3 py-2 uppercase cursor-pointer transition-colors ${
                                      weightUnit === unit ? "bg-[#ff8c42]/15 text-[#ff8c42]" : "text-muted-foreground hover:text-foreground"
                                    }`}
                                    style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em" }}
                                  >
                                    {unit}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(assignment, exercise)}
                          className="w-full sm:w-auto px-3 py-2 bg-primary text-white cursor-pointer hover:opacity-90 transition-opacity uppercase"
                          style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em" }}
                        >
                          {done ? "Mark Incomplete" : "Mark Complete"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === "progress" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Assigned", value: String(totalAssigned) },
              { label: "Completed", value: String(totalCompleted) },
              { label: "Completion", value: `${overallPct}%` },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border p-4">
                <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                  {stat.label}
                </div>
                <div className="text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border p-5">
              <div className="text-muted-foreground uppercase mb-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em" }}>
                This Week Completion %
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={weeklyChart} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                  <defs>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff5500" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff5500" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "#636b75", letterSpacing: "0.08em" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "#636b75" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#121517", border: "1px solid #2a3036", fontFamily: "var(--font-mono)", fontSize: 11 }}
                    formatter={(value, name) => {
                      if (name === "load") return [`${value}%`, "Completion"];
                      return [value, name === "assigned" ? "Assigned" : "Completed"];
                    }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#ff5500" fill="url(#loadGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border p-5 flex flex-col items-center justify-center">
              <div className="text-muted-foreground uppercase mb-2 self-start" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em" }}>
                Overall Completion
              </div>
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={completionRing} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" background={{ fill: "#1e2225" }} cornerRadius={0} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <BarChart2 size={16} className="text-primary mb-1" />
                  <div className="text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem" }}>
                    {overallPct}%
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground mt-3 text-center" style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem" }}>
                Based on your assigned exercise calendar
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
