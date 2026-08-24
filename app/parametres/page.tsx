import type { Metadata } from "next";
import { ParametresContent } from "@/components/parametres/parametres-content";
import { ProfileHeader } from "@/components/parametres/profile-header";
import { SettingsMenu } from "@/components/parametres/settings-menu";
import { getUserPreferSession, isAnonymousUser, userAccountLabel } from "@/lib/auth-guest";
import { createClient } from "@/lib/supabase/server";
import { resolveUserFirstName } from "@/lib/user-name";

export const metadata: Metadata = {
  title: "Profil & Paramètres",
  description: "Vos préférences alimentaires, vos objectifs et les réglages de l'application.",
};

export default async function ParametresPage() {
  const supabase = await createClient();
  const user = await getUserPreferSession(supabase);
  const firstName = await resolveUserFirstName(supabase, user);

  return (
    <div className="min-h-screen bg-[#F6F8F3]">
      <main className="mx-auto max-w-md px-4 pb-10 sm:max-w-2xl">
        <div className="fade-up">
          <ProfileHeader
            firstName={firstName}
            email={userAccountLabel(user)}
            isAnonymous={isAnonymousUser(user)}
          />
        </div>

        <ParametresContent />

        <section className="fade-up" style={{ animationDelay: "0.24s" }}>
          <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Paramètres</h2>
          <SettingsMenu />
          <p className="mt-5 text-center text-xs font-medium text-[#9CA3AF]">My Kitchen · version 0.1.0</p>
        </section>
      </main>
    </div>
  );
}
