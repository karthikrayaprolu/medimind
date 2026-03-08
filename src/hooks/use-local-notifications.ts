import { useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, ScheduleOptions } from "@capacitor/local-notifications";

interface Schedule {
  _id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  timings: string[];
  custom_times?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
  };
  enabled: boolean;
}

// Default times for each timing period
const DEFAULT_TIMES: Record<string, { hour: number; minute: number }> = {
  morning: { hour: 8, minute: 0 },
  afternoon: { hour: 13, minute: 0 },
  evening: { hour: 18, minute: 0 },
  night: { hour: 21, minute: 0 },
};

// Parse "HH:MM" string into hour and minute
function parseTime(timeStr: string): { hour: number; minute: number } | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

// Generate a stable numeric ID from schedule ID + timing
function generateNotificationId(scheduleId: string, timing: string): number {
  let hash = 0;
  const str = `${scheduleId}_${timing}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // Convert to 32-bit integer
  }
  // Ensure positive and within safe range (1 to 2^31 - 1)
  return Math.abs(hash) % 2147483647 || 1;
}

// Build a fingerprint of the current schedule set so we only re-schedule when something changes
function buildScheduleFingerprint(schedules: Schedule[], enabled: boolean): string {
  if (!enabled) return "disabled";
  const data = schedules
    .filter((s) => s.enabled)
    .map((s) => `${s._id}|${s.timings.join(",")}|${JSON.stringify(s.custom_times || {})}`)
    .sort()
    .join(";");
  return data || "empty";
}

const FINGERPRINT_KEY = "medimind-notif-fingerprint";

export function useLocalNotifications(schedules: Schedule[], notificationsEnabled: boolean) {
  const isSupported = Capacitor.isNativePlatform();
  const lastFingerprintRef = useRef<string>("");

  // Request permissions on mount
  useEffect(() => {
    if (!isSupported) return;

    (async () => {
      try {
        let perm = await LocalNotifications.checkPermissions();
        if (perm.display === "prompt" || perm.display === "prompt-with-rationale") {
          perm = await LocalNotifications.requestPermissions();
        }

        if (perm.display !== "granted") {
          console.warn("[LocalNotif] Permission denied");
        } else {
          console.log("[LocalNotif] Permission granted");
        }
      } catch (err) {
        console.error("[LocalNotif] Permission error:", err);
      }
    })();
  }, [isSupported]);

  // Listen for notification actions
  useEffect(() => {
    if (!isSupported) return;

    const listener = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (action) => {
        console.log("[LocalNotif] Action performed:", action);
      }
    );

    return () => {
      listener.then((l) => l.remove());
    };
  }, [isSupported]);

  // Schedule local notifications whenever schedules or notificationsEnabled changes
  const scheduleNotifications = useCallback(async () => {
    if (!isSupported) return;

    // Build fingerprint to avoid duplicate re-scheduling with same data
    const fingerprint = buildScheduleFingerprint(schedules, notificationsEnabled);
    try {
      const stored = localStorage.getItem(FINGERPRINT_KEY) || "";
      if (fingerprint === stored && fingerprint === lastFingerprintRef.current) {
        console.log("[LocalNotif] Schedules unchanged, skipping re-schedule");
        return;
      }
    } catch { /* ignore */ }
    lastFingerprintRef.current = fingerprint;

    try {
      // Cancel all previously scheduled notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
        console.log(`[LocalNotif] Cancelled ${pending.notifications.length} existing notifications`);
      }

      // If notifications are disabled, don't schedule new ones
      if (!notificationsEnabled) {
        console.log("[LocalNotif] Notifications disabled, skipping scheduling");
        try { localStorage.setItem(FINGERPRINT_KEY, fingerprint); } catch {}
        return;
      }

      // Only schedule for enabled schedules
      const enabledSchedules = schedules.filter((s) => s.enabled);
      if (enabledSchedules.length === 0) {
        console.log("[LocalNotif] No enabled schedules");
        try { localStorage.setItem(FINGERPRINT_KEY, fingerprint); } catch {}
        return;
      }

      // Use a Set to prevent duplicate notification IDs
      const seenIds = new Set<number>();
      const notifications: ScheduleOptions["notifications"] = [];

      for (const schedule of enabledSchedules) {
        for (const timing of schedule.timings) {
          // Determine the time — use custom_times if available, else defaults
          const customTime = schedule.custom_times?.[timing as keyof typeof schedule.custom_times];
          const time = customTime ? parseTime(customTime) : DEFAULT_TIMES[timing];

          if (!time) continue;

          const notifId = generateNotificationId(schedule._id, timing);

          // Skip duplicate IDs (same schedule+timing combo)
          if (seenIds.has(notifId)) continue;
          seenIds.add(notifId);

          notifications.push({
            id: notifId,
            title: `💊 Time for ${schedule.medicine_name}`,
            body: `Take ${schedule.dosage} now (${timing.charAt(0).toUpperCase() + timing.slice(1)}).`,
            schedule: {
              on: {
                hour: time.hour,
                minute: time.minute,
              },
              repeats: true,
              allowWhileIdle: true, // Fire even in Doze mode
            },
            sound: "default",
            smallIcon: "ic_notification",
            largeIcon: "ic_notification",
            channelId: "medication_reminders",
            extra: {
              schedule_id: schedule._id,
              medicine_name: schedule.medicine_name,
              dosage: schedule.dosage,
              timing: timing,
              type: "medication_reminder",
            },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`[LocalNotif] Scheduled ${notifications.length} notifications for ${enabledSchedules.length} medicines`);
      }

      // Persist fingerprint so we don't redundantly re-schedule on next app open
      try { localStorage.setItem(FINGERPRINT_KEY, fingerprint); } catch {}
    } catch (err) {
      console.error("[LocalNotif] Error scheduling notifications:", err);
    }
  }, [isSupported, schedules, notificationsEnabled]);

  // Create the notification channel (Android)
  useEffect(() => {
    if (!isSupported) return;

    (async () => {
      try {
        await LocalNotifications.createChannel({
          id: "medication_reminders",
          name: "Medication Reminders",
          description: "Reminders to take your medication on time",
          importance: 5, // Max importance
          visibility: 1, // Public
          sound: "default",
          vibration: true,
          lights: true,
        });
        console.log("[LocalNotif] Channel created: medication_reminders");
      } catch (err) {
        // Channel creation may fail on non-Android platforms, which is fine
        console.log("[LocalNotif] Channel creation skipped:", err);
      }
    })();
  }, [isSupported]);

  // Re-schedule notifications whenever schedules or notifications toggle changes
  useEffect(() => {
    // Small delay to batch rapid changes
    const timeout = setTimeout(() => {
      scheduleNotifications();
    }, 500);

    return () => clearTimeout(timeout);
  }, [scheduleNotifications]);

  return { scheduleNotifications };
}

export default useLocalNotifications;
