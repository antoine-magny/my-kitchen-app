"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { daysUntilDlc, dlcStatus, type FridgeItem } from "@/lib/fridge";

type Urgency = "red" | "orange" | "green";

function fridgeUrgency(item: FridgeItem): Urgency {
  const status = dlcStatus(item.expirationDate);
  if (status === "urgent") return "red";
  if (status === "soon") return "orange";
  return "green";
}

function fridgeDetail(item: FridgeItem): string {
  if (!item.expirationDate) return "Sans DLC";
  const days = daysUntilDlc(item.expirationDate);
  if (days < 0) {
    const n = Math.abs(days);
    return `Périmé depuis ${n} jour${n > 1 ? "s" : ""}`;
  }
  if (days === 0) return "Expire aujourd'hui";
  if (days === 1) return "Expire demain";
  return `Expire dans ${days} jours`;
}

const urgencyConfig: Record<Urgency, { dot: string; bg: string; text: string; label: string }> = {
  red: { dot: "#EF4444", bg: "#FEF2F2", text: "#B91C1C", label: "Urgent" },
  orange: { dot: "#F97316", bg: "#FFF7ED", text: "#C2410C", label: "Bientôt" },
  green: { dot: "#4A7C59", bg: "#F0F7F2", text: "#2E5C3A", label: "OK" },
};

function tipForExpiring(expiring: FridgeItem[]): string {
  const urgent = expiring.find((i) => i.expirationDate && daysUntilDlc(i.expirationDate) <= 2);
  if (urgent && urgent.expirationDate) {
    const d = daysUntilDlc(urgent.expirationDate);
    const timeStr = d <= 0 ? "ce soir" : d === 1 ? "demain" : `dans ${d} jours`;
    return `Pensez à cuisiner votre ${urgent.customName.toLowerCase()} avant ${timeStr} !`;
  }
  return "C'est la saison des courges ! N'hésitez pas à les rôtir au four avec un peu d'huile d'olive et de romarin.";
}

export function ExpiringSection({ items }: { items: FridgeItem[] }) {
  return (
    <section className="fade-up" style={{ animationDelay: "0.24s" }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-lora text-lg font-bold text-[#1C2B1E]">Ingrédients bientôt périmés</h2>
        <Link href="/frigo" className="flex items-center gap-1 text-sm font-semibold text-[#4A7C59] transition-opacity hover:opacity-70">
          Gérer <ChevronRightIcon size={16} />
        </Link>
      </div>

      <div
        className="overflow-hidden rounded-3xl"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
        }}
      >
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-[#7A8F7D]">
              Rien d’urgent pour le moment — votre frigo est sous contrôle.
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            const urgency = fridgeUrgency(item);
            const cfg = urgencyConfig[urgency];
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors"
                style={{
                  borderBottom: idx < items.length - 1 ? "1px solid #F0F4EF" : "none",
                }}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: cfg.dot, boxShadow: `0 0 0 3px ${cfg.bg}` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#1C2B1E]">{item.customName}</p>
                  <p className="mt-0.5 text-xs font-medium text-[#7A8F7D]">{fridgeDetail(item)}</p>
                </div>
                <span
                  className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold"
                  style={{ background: cfg.bg, color: cfg.text }}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#C8E0CF] bg-[#EBF2EC] px-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#4A7C59] text-base">
          <span className="text-base">💡</span>
        </div>
        <div>
          <p className="text-sm font-bold text-[#2E5C3A]">Conseil du jour</p>
          <p className="mt-0.5 text-xs leading-relaxed font-medium text-[#4A7C59]">{tipForExpiring(items)}</p>
        </div>
      </div>
    </section>
  );
}
