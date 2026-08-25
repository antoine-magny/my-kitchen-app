"use client";

import { FridgeIcon } from "@/components/icons";
import { DLC_DAYS_OPTIONS } from "@/lib/notifications-store";
import { NotificationToggleRow } from "./notification-toggle-row";

type DlcAlertsCardProps = {
  enabled: boolean;
  daysBefore: number;
  alertHour: string;
  onChange: (patch: {
    dlcAlertsEnabled?: boolean;
    dlcDaysBefore?: number;
    dlcAlertHour?: string;
  }) => void;
};

export function DlcAlertsCard({
  enabled,
  daysBefore,
  alertHour,
  onChange,
}: DlcAlertsCardProps) {
  return (
    <div className="rounded-2xl border border-[#E2EBE3] bg-white p-4">
      <NotificationToggleRow
        id="toggle-dlc"
        icon={<FridgeIcon size={18} />}
        title="Alertes de péremption (DLC)"
        description="Recevez un rappel avant que vos aliments n'arrivent à expiration."
        checked={enabled}
        onChange={(checked) => onChange({ dlcAlertsEnabled: checked })}
      />

      {enabled && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#F0F4EF] pt-3">
          <div>
            <label
              htmlFor="dlc-days"
              className="mb-1 block text-[11px] font-bold uppercase text-[#7A8F7D]"
            >
              Délai d&apos;anticipation
            </label>
            <select
              id="dlc-days"
              value={daysBefore}
              onChange={(e) => onChange({ dlcDaysBefore: Number(e.target.value) })}
              className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2 text-xs font-bold text-[#1C2B1E] outline-none focus:border-[#4A7C59]"
            >
              {DLC_DAYS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dlc-hour"
              className="mb-1 block text-[11px] font-bold uppercase text-[#7A8F7D]"
            >
              Heure du rappel
            </label>
            <input
              id="dlc-hour"
              type="time"
              value={alertHour}
              onChange={(e) => onChange({ dlcAlertHour: e.target.value })}
              className="w-full rounded-xl border border-[#E2EBE3] bg-[#FAFBF9] px-3 py-2 text-xs font-bold text-[#1C2B1E] outline-none focus:border-[#4A7C59]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
