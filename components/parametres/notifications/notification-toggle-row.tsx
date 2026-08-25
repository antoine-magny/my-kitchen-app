"use client";

import type { ReactNode } from "react";

type NotificationToggleRowProps = {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function NotificationToggleRow({
  id,
  icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: NotificationToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F0F4EF] text-[#4A7C59]">
          {icon}
        </div>
        <div className="min-w-0">
          <label htmlFor={id} className="block text-sm font-bold text-[#1C2B1E] cursor-pointer">
            {title}
          </label>
          <p className="mt-0.5 text-xs text-[#7A8F7D] leading-relaxed">{description}</p>
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? "bg-[#4A7C59]" : "bg-[#D1DDD2]"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
