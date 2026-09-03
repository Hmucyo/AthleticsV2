// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useEffect } from "react";
import { Bell, BellOff, Dumbbell, Sunrise, Sunset } from "lucide-react";
import {
  formatNotificationTime,
  type AthleteNotification,
} from "../../../lib/notifications";

interface AthleteNotificationsProps {
  notifications: AthleteNotification[];
  onMarkAllRead: () => void;
  onOpenTraining: () => void;
}

export function AthleteNotifications({
  notifications,
  onMarkAllRead,
  onOpenTraining,
}: AthleteNotificationsProps) {
  useEffect(() => {
    onMarkAllRead();
  }, [onMarkAllRead, notifications.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
      <div>
        <div
          className="text-muted-foreground uppercase mb-1"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em" }}
        >
          Alerts
        </div>
        <h1
          className="text-foreground uppercase"
          style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, lineHeight: 1, letterSpacing: "0.04em" }}
        >
          Workout
          <br />
          <span className="text-primary">Notifications</span>
        </h1>
        <p className="text-muted-foreground mt-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>
          Morning and evening reminders stay here after the pop-up disappears.
        </p>
      </div>

      <div className="bg-card border border-border">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="w-12 h-12 border border-border bg-secondary/40 flex items-center justify-center mb-3">
              <BellOff size={18} className="text-muted-foreground" />
            </div>
            <div
              className="text-foreground uppercase"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.06em" }}
            >
              No reminders yet
            </div>
            <p className="text-muted-foreground mt-1.5 max-w-xs" style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
              When you have exercises assigned for today, a morning and evening pop-up will be saved in this list.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((item) => {
              const SlotIcon = item.slot === "morning" ? Sunrise : Sunset;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={onOpenTraining}
                    className="w-full text-left px-4 py-3.5 hover:bg-secondary/50 transition-colors cursor-pointer flex items-start gap-3"
                  >
                    <div
                      className={`mt-0.5 w-9 h-9 shrink-0 flex items-center justify-center border ${
                        item.read
                          ? "border-border bg-secondary/40 text-muted-foreground"
                          : "border-[#ff8c42]/40 bg-[#ff8c42]/10 text-[#ff8c42]"
                      }`}
                    >
                      <SlotIcon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[#ff8c42] uppercase"
                          style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em" }}
                        >
                          {item.slot === "morning" ? "Morning" : "Evening"}
                        </span>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff8c42]" aria-label="Unread" />
                        )}
                        <span
                          className="ml-auto text-muted-foreground"
                          style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.06em" }}
                        >
                          {formatNotificationTime(item.createdAt)}
                        </span>
                      </div>
                      <div
                        className="text-foreground mt-1"
                        style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem" }}
                      >
                        {item.message}
                      </div>
                      <div
                        className="text-muted-foreground mt-1 inline-flex items-center gap-1.5"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em" }}
                      >
                        <Dumbbell size={11} />
                        {item.pendingCount} assigned for {item.dateKey}
                      </div>
                    </div>
                    <Bell size={14} className="mt-1 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
