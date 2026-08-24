import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F7F9F6] px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#2E5B3E]">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
        ) : null}
      </div>

      <div className="mx-auto mt-8 w-full max-w-md">
        <div className="rounded-xl bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">{children}</div>
      </div>
    </div>
  );
}
