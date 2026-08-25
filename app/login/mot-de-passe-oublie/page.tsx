import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./forgot-form";
import { getUserPreferSession, isAnonymousUser } from "@/lib/auth-guest";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mot de passe oublié — My Kitchen",
};

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const user = await getUserPreferSession(supabase);
  if (user && !isAnonymousUser(user)) {
    redirect("/");
  }

  const params = await searchParams;
  return <ForgotPasswordForm initialEmail={firstSearchParam(params.email) ?? ""} />;
}
