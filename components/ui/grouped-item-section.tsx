import type { ReactNode } from "react";

export function GroupedItemSection({
  id,
  title,
  dot,
  action,
  children,
}: {
  id: string;
  title: string;
  dot?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`cat-${id}`}>
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2
          id={`cat-${id}`}
          className="flex min-w-0 items-center gap-1.5 text-sm font-bold text-[#1C2B1E]"
        >
          {dot ? (
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} aria-hidden />
          ) : null}
          {title}
        </h2>
        {action}
      </div>
      <div
        className="overflow-hidden rounded-3xl"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(74,124,89,0.09)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
