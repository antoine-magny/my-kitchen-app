"use client";

import { useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import {
  addDays,
  addMonths,
  buildMonthCells,
  calendarDateFromIso,
  formatDayLongFr,
  formatMonthYearFr,
  isoDateFromCalendar,
  parisCalendarDate,
  startOfMonth,
  WEEKDAY_LETTERS_FR,
} from "@/lib/date-paris";

const SHORTCUTS = [
  { id: "plus3", label: "+3 j", apply: (today: Date) => addDays(today, 3) },
  { id: "plus7", label: "+7 j", apply: (today: Date) => addDays(today, 7) },
  { id: "plusMonth", label: "+1 mois", apply: (today: Date) => addMonths(today, 1) },
] as const;

export function DlcDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const today = useMemo(() => parisCalendarDate(), []);
  const todayIso = isoDateFromCalendar(today);
  const [cursor, setCursor] = useState(() => calendarDateFromIso(value) ?? today);

  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const selectIso = (iso: string) => {
    if (iso === value) {
      onChange("");
      return;
    }
    onChange(iso);
    const next = calendarDateFromIso(iso);
    if (next) setCursor(next);
  };

  return (
    <div
      className="mx-auto w-full max-w-[260px] rounded-2xl bg-[#FAFBF9] p-2.5"
      style={{ border: "1.5px solid #E2EBE3" }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <p className="font-lora text-sm font-bold text-[#1C2B1E]">
          {formatMonthYearFr(cursor)}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCursor((prev) => addMonths(startOfMonth(prev), -1))}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-[#4A7C59] transition-colors hover:bg-[#E8F0EA] active:scale-95"
            aria-label="Mois précédent"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCursor((prev) => addMonths(startOfMonth(prev), 1))}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-[#4A7C59] transition-colors hover:bg-[#E8F0EA] active:scale-95"
            aria-label="Mois suivant"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <div className="mb-0.5 grid grid-cols-7" aria-hidden>
        {WEEKDAY_LETTERS_FR.map((letter, idx) => (
          <span
            key={`${letter}-${idx}`}
            className="py-0.5 text-center text-[10px] font-bold tracking-wide text-[#7A8F7D]"
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5" role="group" aria-label="Calendrier de la DLC">
        {cells.map((cell) => {
          const selected = cell.iso === value;
          const isToday = cell.iso === todayIso;
          const date = calendarDateFromIso(cell.iso);
          return (
            <button
              key={cell.iso}
              type="button"
              aria-pressed={selected}
              aria-current={isToday ? "date" : undefined}
              aria-label={date ? formatDayLongFr(date) : cell.iso}
              onClick={() => selectIso(cell.iso)}
              className="flex h-7 items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95"
              style={
                selected
                  ? {
                      background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                      color: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(74,124,89,0.28)",
                    }
                  : {
                      color: cell.inMonth ? "#1C2B1E" : "#B7C4B9",
                      boxShadow: isToday ? "inset 0 0 0 1.5px #4A7C59" : undefined,
                      background: isToday ? "#E8F0EA" : "transparent",
                    }
              }
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-1.5">
        {SHORTCUTS.map((shortcut) => {
          const iso = isoDateFromCalendar(shortcut.apply(today));
          const active = iso === value;
          return (
            <button
              key={shortcut.id}
              type="button"
              onClick={() => selectIso(iso)}
              className="flex-1 rounded-xl py-1.5 text-[11px] font-bold transition-all active:scale-95"
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #4A7C59, #5E9E72)",
                      color: "#FFFFFF",
                    }
                  : {
                      background: "#FFFFFF",
                      color: "#4A7C59",
                      border: "1.5px solid #E2EBE3",
                    }
              }
            >
              {shortcut.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
