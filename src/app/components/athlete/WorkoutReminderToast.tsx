// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { Bell, X } from "lucide-react";
import { TOAST_DURATION_MS, type AthleteNotification } from "../../../lib/notifications";

interface WorkoutReminderToastProps {
  notification: AthleteNotification;
  onDismiss: () => void;
  onOpen: () => void;
}

export function WorkoutReminderToast({ notification, onDismiss, onOpen }: WorkoutReminderToastProps) {
  const label = notification.slot === "morning" ? "Morning reminder" : "Evening reminder";

  return (
    <div
      className="fixed z-[70] left-3 right-3 top-[4.75rem] md:left-auto md:right-4 md:top-4 md:w-[22rem]"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left border border-[#ff8c42]/40 bg-[#131618] shadow-2xl overflow-hidden cursor-pointer"
      >
        <div className="flex items-start gap-3 px-3 py-3">
          <div className="mt-0.5 w-8 h-8 shrink-0 border border-[#ff8c42]/40 bg-[#ff8c42]/10 flex items-center justify-center">
            <Bell size={15} className="text-[#ff8c42]" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[#ff8c42] uppercase"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em" }}
            >
              {label}
            </div>
            <div
              className="text-foreground mt-1"
              style={{ fontFamily: "var(--font-body)", fontSize: "0.86rem", lineHeight: 1.35 }}
            >
              {notification.message}
            </div>
          </div>
          <span
            role="button"
            tabIndex={0}
            aria-label="Dismiss notification"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onDismiss();
              }
            }}
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={14} />
          </span>
        </div>
        <div className="h-0.5 bg-[#ff8c42]/15">
          <div
            className="h-full bg-[#ff8c42] origin-left"
            style={{ animation: `afsp-toast-progress ${TOAST_DURATION_MS}ms linear forwards` }}
          />
        </div>
      </button>
      <style>{`
        @keyframes afsp-toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
