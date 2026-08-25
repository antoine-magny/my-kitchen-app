import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getUserPreferSession, isAnonymousUser } from "@/lib/auth-guest";
import { createClient } from "@/lib/supabase/server";

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
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
  return (
    <LoginForm
      oauthError={firstSearchParam(params.error)}
      oauthEmail={firstSearchParam(params.email)}
    />
  );
}
