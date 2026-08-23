import type { Metadata } from "next";
import { EquipmentCard } from "@/components/parametres/equipment-card";
import { GoalsCard } from "@/components/parametres/goals-card";
import { PreferenceCard } from "@/components/parametres/preference-card";
import { ProfileHeader } from "@/components/parametres/profile-header";
import { SettingsMenu } from "@/components/parametres/settings-menu";
import { StatsCard } from "@/components/parametres/stats-card";
import { TasteTestBanner } from "@/components/parametres/taste-test-banner";
import { PREFERENCE_GROUPS } from "@/lib/profile";
import { getUserPreferSession, userAccountLabel } from "@/lib/auth-guest";
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
          <ProfileHeader firstName={firstName} email={userAccountLabel(user)} />
        </div>

        <section className="fade-up mb-7" style={{ animationDelay: "0.08s" }}>
          <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Statistiques &amp; suivi</h2>
          <StatsCard />
        </section>

        <section className="fade-up mb-7" style={{ animationDelay: "0.12s" }}>
          <TasteTestBanner />
        </section>

        <section className="fade-up mb-7" style={{ animationDelay: "0.16s" }}>
          <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Préférences alimentaires</h2>
          <div className="flex flex-col gap-3">
            {PREFERENCE_GROUPS.map((group) => (
              <PreferenceCard key={group.kind} group={group} />
            ))}
          </div>
        </section>

        <section className="fade-up mb-7" style={{ animationDelay: "0.20s" }}>
          <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Ma cuisine &amp; objectifs</h2>
          <div className="flex flex-col gap-3">
            <GoalsCard />
            <EquipmentCard />
          </div>
        </section>

        <section className="fade-up" style={{ animationDelay: "0.24s" }}>
          <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Paramètres</h2>
          <SettingsMenu />
          <p className="mt-5 text-center text-xs font-medium text-[#9CA3AF]">My Kitchen · version 0.1.0</p>
        </section>
      </main>
    </div>
  );
}
