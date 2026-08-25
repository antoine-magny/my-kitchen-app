"use client";

import { CartIcon, FlameIcon } from "@/components/icons";
import { DAYS_OF_WEEK } from "@/lib/notifications-store";
import { NotificationToggleRow } from "./notification-toggle-row";

type ShoppingRemindersCardProps = {
  shoppingEnabled: boolean;
  shoppingDay: number;
  shoppingHour: string;
  weeklyRecapEnabled: boolean;
  onChange: (patch: {
    shoppingRemindersEnabled?: boolean;
    shoppingReminderDay?: number;
    shoppingReminderHour?: string;
    weeklyRecapEnabled?: boolean;
  }) => void;
};

export function ShoppingRemindersCard({
  shoppingEnabled,
  shoppingDay,
  shoppingHour,
  weeklyRecapEnabled,
  onChange,
}: ShoppingRemindersCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
        <NotificationToggleRow
          id="toggle-shopping"
          icon={<CartIcon size={18} />}
          title="Rappel de la liste de courses"
          description="N'oubliez plus vos ingrédients manquants avant de faire vos achats."
          checked={shoppingEnabled}
          onChange={(checked) => onChange({ shoppingRemindersEnabled: checked })}
        />

        {shoppingEnabled && (
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#F0F4EF] pt-3">
            <div>
              <label
                htmlFor="shopping-day"
                className="mb-1 block text-[11px] font-bold uppercase text-[#7A8F7D]"
              >
                Jour prévu
              </label>
              <select
                id="shopping-day"
                value={shoppingDay}
                onChange={(e) => onChange({ shoppingReminderDay: Number(e.target.value) })}
                className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2 text-xs font-bold text-[#1C2B1E] outline-none focus:border-[#4A7C59]"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="shopping-hour"
                className="mb-1 block text-[11px] font-bold uppercase text-[#7A8F7D]"
              >
                Heure
              </label>
              <input
                id="shopping-hour"
                type="time"
                value={shoppingHour}
                onChange={(e) => onChange({ shoppingReminderHour: e.target.value })}
                className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2 text-xs font-bold text-[#1C2B1E] outline-none focus:border-[#4A7C59]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
        <NotificationToggleRow
          id="toggle-recap"
          icon={<FlameIcon size={18} />}
          title="Bilan anti-gaspillage hebdo"
          description="Résumé de votre score anti-gaspi et économies chaque dimanche soir."
          checked={weeklyRecapEnabled}
          onChange={(checked) => onChange({ weeklyRecapEnabled: checked })}
        />
      </div>
    </div>
  );
}
