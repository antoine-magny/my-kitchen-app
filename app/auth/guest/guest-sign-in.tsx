"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { safeAuthNextPath } from "@/lib/auth-google";
import {
  GUEST_AUTH_ERROR,
  guestAuthErrorMessage,
  signInAsGuest,
} from "@/lib/auth-guest";
import { createClient } from "@/lib/supabase/client";

export function GuestSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const next = safeAuthNextPath(searchParams.get("next"));

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const { error: guestError } = await signInAsGuest(supabase);
        if (guestError) {
          setError(guestAuthErrorMessage(guestError));
          router.replace(`/login?error=${GUEST_AUTH_ERROR}`);
          return;
        }
      }

      router.replace(next);
      router.refresh();
    })();
  }, [router, searchParams]);

  return (
    <AuthCard title="My Kitchen App" subtitle="Connexion en tant qu'invité…">
      <p className="text-center text-sm text-gray-500">
        {error ?? "Un instant."}
      </p>
    </AuthCard>
  );
}
