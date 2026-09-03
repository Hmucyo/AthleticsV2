// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { toDateKey, type AthleteExerciseAssignment } from "./training";

export type ReminderSlot = "morning" | "evening";

export interface AthleteNotification {
  id: string;
  athleteEmail: string;
  slot: ReminderSlot;
  dateKey: string;
  pendingCount: number;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationState {
  items: AthleteNotification[];
}

const STORAGE_KEY = "afsp-notifications-v1";
const MORNING_START_HOUR = 5;
const MORNING_END_HOUR = 12;
const EVENING_START_HOUR = 17;

export const TOAST_DURATION_MS = 8000;

export function getAppNow(): Date {
  if (typeof window !== "undefined" && import.meta.env.DEV) {
    const override = window.localStorage.getItem("afsp-debug-now");
    if (override) {
      const parsed = new Date(override);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return new Date();
}

export function getReminderSlot(now: Date = getAppNow()): ReminderSlot | null {
  return getReminderContext(now)?.slot ?? null;
}

export function getReminderContext(now: Date = getAppNow()): { slot: ReminderSlot; dateKey: string } | null {
  const hour = now.getHours();
  if (hour >= MORNING_START_HOUR && hour < MORNING_END_HOUR) {
    return { slot: "morning", dateKey: toDateKey(now) };
  }
  if (hour >= EVENING_START_HOUR) {
    return { slot: "evening", dateKey: toDateKey(now) };
  }
  if (hour < MORNING_START_HOUR) {
    const previous = new Date(now);
    previous.setDate(previous.getDate() - 1);
    return { slot: "evening", dateKey: toDateKey(previous) };
  }
  return null;
}

export function formatReminderMessage(slot: ReminderSlot, pendingCount: number): string {
  if (slot === "morning") {
    return `You have ${pendingCount} pending exercises today`;
  }
  return `You still have ${pendingCount} pending exercises`;
}

export function countPendingForDate(
  assignments: AthleteExerciseAssignment[],
  athleteEmail: string,
  dateKey: string
): number {
  const email = athleteEmail.toLowerCase();
  return assignments.filter(
    (item) =>
      item.athleteEmail.toLowerCase() === email &&
      item.scheduledDate === dateKey &&
      !item.completed
  ).length;
}

function reminderId(athleteEmail: string, dateKey: string, slot: ReminderSlot): string {
  return `workout-${slot}-${dateKey}-${athleteEmail.toLowerCase()}`;
}

export function loadNotificationState(): NotificationState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as Partial<NotificationState>;
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

export function saveNotificationState(state: NotificationState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function notificationsForAthlete(athleteEmail: string): AthleteNotification[] {
  const email = athleteEmail.toLowerCase();
  return loadNotificationState()
    .items.filter((item) => item.athleteEmail.toLowerCase() === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCountForAthlete(athleteEmail: string): number {
  return notificationsForAthlete(athleteEmail).filter((item) => !item.read).length;
}

export function hasShownReminder(athleteEmail: string, dateKey: string, slot: ReminderSlot): boolean {
  const id = reminderId(athleteEmail, dateKey, slot);
  return loadNotificationState().items.some((item) => item.id === id);
}

export function recordReminder(payload: {
  athleteEmail: string;
  slot: ReminderSlot;
  dateKey: string;
  pendingCount: number;
  now?: Date;
}): AthleteNotification {
  const now = payload.now ?? getAppNow();
  const id = reminderId(payload.athleteEmail, payload.dateKey, payload.slot);
  const state = loadNotificationState();
  const existing = state.items.find((item) => item.id === id);
  if (existing) return existing;

  const notification: AthleteNotification = {
    id,
    athleteEmail: payload.athleteEmail.toLowerCase(),
    slot: payload.slot,
    dateKey: payload.dateKey,
    pendingCount: payload.pendingCount,
    message: formatReminderMessage(payload.slot, payload.pendingCount),
    createdAt: now.toISOString(),
    read: false,
  };

  saveNotificationState({ items: [notification, ...state.items] });
  return notification;
}

export function markAthleteNotificationsRead(athleteEmail: string): AthleteNotification[] {
  const email = athleteEmail.toLowerCase();
  const state = loadNotificationState();
  const items = state.items.map((item) =>
    item.athleteEmail.toLowerCase() === email ? { ...item, read: true } : item
  );
  saveNotificationState({ items });
  return items
    .filter((item) => item.athleteEmail.toLowerCase() === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(id: string, athleteEmail: string): AthleteNotification[] {
  const state = loadNotificationState();
  const items = state.items.map((item) => (item.id === id ? { ...item, read: true } : item));
  saveNotificationState({ items });
  return notificationsForAthlete(athleteEmail);
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const todayKey = toDateKey(getAppNow());
  const dateKey = toDateKey(date);
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (dateKey === todayKey) return time;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${time}`;
}

export { toDateKey };
