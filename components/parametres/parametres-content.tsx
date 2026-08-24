"use client";

import { useMemo, useState } from "react";
import { EquipmentCard } from "@/components/parametres/equipment-card";
import { GoalsCard } from "@/components/parametres/goals-card";
import { PreferenceCard } from "@/components/parametres/preference-card";
import { QuizModal } from "@/components/parametres/quiz-modal";
import { StatsCard } from "@/components/parametres/stats-card";
import { TasteTestBanner } from "@/components/parametres/taste-test-banner";
import { PREFERENCE_GROUPS, type PreferenceKind } from "@/lib/profile";
import type { UserProfile } from "@/lib/profile-store";
import { useProfile } from "@/lib/use-profile";

/**
 * Contenu client de la page `/parametres`.
 *
 * Centralise l'appel à `useProfile()` et distribue les données
 * persistées à chaque carte enfant via props.
 */
export function ParametresContent() {
  const { profile, patch } = useProfile();
  const [quizOpen, setQuizOpen] = useState(false);

  const equipmentSet = useMemo(() => new Set(profile.equipmentIds), [profile.equipmentIds]);

  /** Mapping PreferenceKind → champ du profil. */
  const tagsForKind = (kind: PreferenceKind): string[] => {
    if (kind === "favorite") return profile.favoriteTags;
    if (kind === "disliked") return profile.dislikedTags;
    return profile.allergyTags;
  };

  const handleTagsChange = (kind: PreferenceKind, tags: string[]) => {
    if (kind === "favorite") patch({ favoriteTags: tags });
    else if (kind === "disliked") patch({ dislikedTags: tags });
    else patch({ allergyTags: tags });
  };

  const handleEquipmentToggle = (id: string) => {
    const next = new Set(equipmentSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    patch({ equipmentIds: [...next] });
  };

  const handleQuizComplete = (quizPatch: Partial<UserProfile>) => {
    patch(quizPatch);
    setQuizOpen(false);
  };

  return (
    <>
      <section className="fade-up mb-7" style={{ animationDelay: "0.08s" }}>
        <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Statistiques &amp; suivi</h2>
        <StatsCard />
      </section>

      <section className="fade-up mb-7" style={{ animationDelay: "0.12s" }}>
        <TasteTestBanner
          hasCompletedQuiz={profile.quizCompletedAt !== null}
          onClick={() => setQuizOpen(true)}
        />
      </section>

      <section className="fade-up mb-7" style={{ animationDelay: "0.16s" }}>
        <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Préférences alimentaires</h2>
        <div className="flex flex-col gap-3">
          {PREFERENCE_GROUPS.map((group) => (
            <PreferenceCard
              key={group.kind}
              group={group}
              tags={tagsForKind(group.kind)}
              onTagsChange={(tags) => handleTagsChange(group.kind, tags)}
            />
          ))}
        </div>
      </section>

      <section className="fade-up mb-7" style={{ animationDelay: "0.20s" }}>
        <h2 className="font-lora mb-3 text-lg font-bold text-[#1C2B1E]">Ma cuisine &amp; objectifs</h2>
        <div className="flex flex-col gap-3">
          <GoalsCard
            goal={profile.goal}
            calories={profile.calories}
            proteins={profile.proteins}
            weightKg={profile.weightKg}
            heightCm={profile.heightCm}
            onGoalChange={(goal) => patch({ goal })}
            onCaloriesChange={(calories) => patch({ calories })}
            onProteinsChange={(proteins) => patch({ proteins })}
            onCalculatedTargets={(result) => patch(result)}
          />
          <EquipmentCard selected={equipmentSet} onToggle={handleEquipmentToggle} />
        </div>
      </section>

      {quizOpen && (
        <QuizModal
          onComplete={handleQuizComplete}
          onClose={() => setQuizOpen(false)}
          initialAnswers={{
            diet: profile.diet,
            allergyTags: profile.allergyTags,
            favoriteTags: profile.favoriteTags,
            dislikedTags: profile.dislikedTags,
            goal: profile.goal,
            cookingLevel: profile.cookingLevel,
            equipmentIds: profile.equipmentIds,
          }}
        />
      )}
    </>
  );
}
