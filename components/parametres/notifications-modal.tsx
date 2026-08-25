"use client";

import { useEffect, useState } from "react";
import { BellIcon, CheckIcon, XIcon } from "@/components/icons";
import { CenteredModal } from "@/components/ui/centered-modal";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  type NotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/notifications-store";
import { BrowserPermissionCard } from "./notifications/browser-permission-card";
import { DlcAlertsCard } from "./notifications/dlc-alerts-card";
import { MealRemindersCard } from "./notifications/meal-reminders-card";
import { ShoppingRemindersCard } from "./notifications/shopping-reminders-card";

type NotificationsModalProps = {
  onClose: () => void;
};

export function NotificationsModal({ onClose }: NotificationsModalProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setPrefs(getNotificationPreferences());
  }, []);

  const handleUpdate = (patch: Partial<NotificationPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveNotificationPreferences(next);
      return next;
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <CenteredModal titleId="notifications-modal-title" onClose={onClose} maxWidthClass="max-w-lg">
      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EBF2EC] text-[#4A7C59]">
              <BellIcon size={20} />
            </div>
            <div>
              <h2 id="notifications-modal-title" className="font-lora text-xl font-bold text-[#1C2B1E]">
                Notifications &amp; Alertes
              </h2>
              <p className="mt-0.5 text-xs text-[#7A8F7D]">
                Personnalisez vos rappels de cuisine et de courses
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-[#F0F4EF] text-[#7A8F7D] transition-colors hover:bg-[#E2EBE3] hover:text-[#1C2B1E] cursor-pointer"
            aria-label="Fermer"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Corps défilable */}
        <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto pr-1">
          <BrowserPermissionCard
            browserPushEnabled={prefs.browserPushEnabled}
            onTogglePush={(enabled) => handleUpdate({ browserPushEnabled: enabled })}
          />

          <DlcAlertsCard
            enabled={prefs.dlcAlertsEnabled}
            daysBefore={prefs.dlcDaysBefore}
            alertHour={prefs.dlcAlertHour}
            onChange={handleUpdate}
          />

          <MealRemindersCard
            enabled={prefs.mealRemindersEnabled}
            lunchHour={prefs.lunchReminderHour}
            dinnerHour={prefs.dinnerReminderHour}
            onChange={handleUpdate}
          />

          <ShoppingRemindersCard
            shoppingEnabled={prefs.shoppingRemindersEnabled}
            shoppingDay={prefs.shoppingReminderDay}
            shoppingHour={prefs.shoppingReminderHour}
            weeklyRecapEnabled={prefs.weeklyRecapEnabled}
            onChange={handleUpdate}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-[#F0F4EF] pt-3">
          <div className="flex min-h-[20px] items-center gap-1.5 text-xs font-medium text-[#4A7C59]">
            {savedToast && (
              <>
                <CheckIcon size={14} />
                <span>Préférences sauvegardées</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#4A7C59] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#3d6849] cursor-pointer"
          >
            Terminé
          </button>
        </div>
      </div>
    </CenteredModal>
  );
}
