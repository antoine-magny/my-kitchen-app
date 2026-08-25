import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import {
  GOOGLE_EXISTING_ACCOUNT_ERROR,
  rejectGoogleLinkedToEmailAccount,
  safeAuthNextPath,
} from "@/lib/auth-google";
import { PASSWORD_RECOVERY_ERROR, UPDATE_PASSWORD_PATH } from "@/lib/auth-password";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");
  const isRecovery = type === "recovery" || rawNext === UPDATE_PASSWORD_PATH;
  const next = isRecovery ? UPDATE_PASSWORD_PATH : safeAuthNextPath(rawNext);

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return handleRedirect(request, origin, next, isRecovery, supabase);
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return handleRedirect(request, origin, next, isRecovery, supabase);
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set(
    "error",
    isRecovery ? PASSWORD_RECOVERY_ERROR : "google",
  );
  return NextResponse.redirect(loginUrl);
}

async function handleRedirect(
  request: Request,
  origin: string,
  next: string,
  isRecovery: boolean,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  // Le contrôle de rejet Google ne concerne que la connexion OAuth Google, JAMAIS la réinitialisation de mot de passe
  if (!isRecovery) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (await rejectGoogleLinkedToEmailAccount(supabase, user)) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", GOOGLE_EXISTING_ACCOUNT_ERROR);
      if (user?.email) {
        loginUrl.searchParams.set("email", user.email);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`);
  }
  if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}

