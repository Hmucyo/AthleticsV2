// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useCallback, useEffect, useState } from "react";
import {
  countPendingForDate,
  getAppNow,
  getReminderSlot,
  hasShownReminder,
  markAthleteNotificationsRead,
  notificationsForAthlete,
  recordReminder,
  TOAST_DURATION_MS,
  toDateKey,
  type AthleteNotification,
} from "../../lib/notifications";
import type { AthleteExerciseAssignment } from "../../lib/training";

const POLL_MS = 30_000;

export function useWorkoutReminders(
  athleteEmail: string | null,
  assignments: AthleteExerciseAssignment[]
) {
  const [items, setItems] = useState<AthleteNotification[]>([]);
  const [toast, setToast] = useState<AthleteNotification | null>(null);

  const refresh = useCallback(() => {
    if (!athleteEmail) {
      setItems([]);
      return;
    }
    setItems(notificationsForAthlete(athleteEmail));
  }, [athleteEmail]);

  useEffect(() => {
    refresh();
    setToast(null);
  }, [refresh]);

  const tryFireCurrentSlot = useCallback(() => {
    if (!athleteEmail) return;
    const now = getAppNow();
    const slot = getReminderSlot(now);
    if (!slot) return;

    const dateKey = toDateKey(now);
    if (hasShownReminder(athleteEmail, dateKey, slot)) return;

    const pendingCount = countPendingForDate(assignments, athleteEmail, dateKey);
    if (pendingCount <= 0) return;

    const notification = recordReminder({
      athleteEmail,
      slot,
      dateKey,
      pendingCount,
      now,
    });
    setItems(notificationsForAthlete(athleteEmail));
    setToast(notification);
  }, [athleteEmail, assignments]);

  useEffect(() => {
    if (!athleteEmail) return;
    tryFireCurrentSlot();
    const timer = window.setInterval(tryFireCurrentSlot, POLL_MS);
    return () => window.clearInterval(timer);
  }, [athleteEmail, tryFireCurrentSlot]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const dismissToast = useCallback(() => setToast(null), []);

  const markAllRead = useCallback(() => {
    if (!athleteEmail) return;
    setItems(markAthleteNotificationsRead(athleteEmail));
  }, [athleteEmail]);

  const unreadCount = items.filter((item) => !item.read).length;

  return {
    notifications: items,
    unreadCount,
    toast,
    dismissToast,
    markAllRead,
    refresh,
  };
}
