import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { GuestSignIn } from "./guest-sign-in";

function GuestFallback() {
  return (
    <AuthCard title="My Kitchen App" subtitle="Connexion en tant qu'invité…">
      <p className="text-center text-sm text-gray-500">Un instant.</p>
    </AuthCard>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={<GuestFallback />}>
      <GuestSignIn />
    </Suspense>
  );
}
