import { NextResponse } from "next/server";
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
  const next = safeAuthNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set(
    "error",
    next === UPDATE_PASSWORD_PATH ? PASSWORD_RECOVERY_ERROR : "google",
  );
  return NextResponse.redirect(loginUrl);
}
