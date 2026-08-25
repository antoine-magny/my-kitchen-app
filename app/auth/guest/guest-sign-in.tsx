"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { safeAuthNextPath } from "@/lib/auth-google";
import {
  GUEST_ACTIVE_SESSION_KEY,
  GUEST_AUTH_ERROR,
  guestAuthErrorMessage,
  signInAsGuest,
} from "@/lib/auth-guest";
import { createClient } from "@/lib/supabase/client";

export function GuestSignIn() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    window.sessionStorage.setItem(GUEST_ACTIVE_SESSION_KEY, "1");

    const supabase = createClient();
    const next = safeAuthNextPath(searchParams.get("next"));

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { error: guestError } = await signInAsGuest(supabase);
        if (guestError) {
          window.sessionStorage.removeItem(GUEST_ACTIVE_SESSION_KEY);
          setError(guestAuthErrorMessage(guestError));
          window.location.replace(`/login?error=${GUEST_AUTH_ERROR}`);
          return;
        }
      }

      window.location.replace(next);
    })();
  }, [searchParams]);

  return (
    <AuthCard title="My Kitchen App" subtitle="Connexion en tant qu'invité…">
      <p className="text-center text-sm text-gray-500">
        {error ?? "Un instant."}
      </p>
    </AuthCard>
  );
}
