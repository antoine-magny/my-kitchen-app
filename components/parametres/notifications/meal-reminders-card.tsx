"use client";

import { ChefHatIcon } from "@/components/icons";
import { NotificationToggleRow } from "./notification-toggle-row";

type MealRemindersCardProps = {
  enabled: boolean;
  lunchHour: string;
  dinnerHour: string;
  onChange: (patch: {
    mealRemindersEnabled?: boolean;
    lunchReminderHour?: string;
    dinnerReminderHour?: string;
  }) => void;
};

export function MealRemindersCard({
  enabled,
  lunchHour,
  dinnerHour,
  onChange,
}: MealRemindersCardProps) {
  return (
    <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
      <NotificationToggleRow
        id="toggle-meals"
        icon={<ChefHatIcon size={18} />}
        title="Rappels des repas du jour"
        description="Suggestion des recettes prévues dans votre planning de la semaine."
        checked={enabled}
        onChange={(checked) => onChange({ mealRemindersEnabled: checked })}
      />

      {enabled && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#F0F4EF] pt-3">
          <div>
            <label
              htmlFor="lunch-hour"
              className="mb-1 block text-[11px] font-bold uppercase text-[#7A8F7D]"
            >
              Déjeuner
            </label>
            <input
              id="lunch-hour"
              type="time"
              value={lunchHour}
              onChange={(e) => onChange({ lunchReminderHour: e.target.value })}
              className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2 text-xs font-bold text-[#1C2B1E] outline-none focus:border-[#4A7C59]"
            />
          </div>

          <div>
            <label
              htmlFor="dinner-hour"
              className="mb-1 block text-[11px] font-bold uppercase text-[#7A8F7D]"
            >
              Dîner
            </label>
            <input
              id="dinner-hour"
              type="time"
              value={dinnerHour}
              onChange={(e) => onChange({ dinnerReminderHour: e.target.value })}
              className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2 text-xs font-bold text-[#1C2B1E] outline-none focus:border-[#4A7C59]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
