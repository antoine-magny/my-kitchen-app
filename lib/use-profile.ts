"use client";

/**
 * Hook d'hydratation pour le profil utilisateur.
 *
 * Pattern identique au reste du projet : état initial par défaut →
 * useEffect lit localStorage → setState. Un second useEffect persiste
 * les changements après l'hydratation initiale.
 */

import { useEffect, useState } from "react";
import {
  DEFAULT_PROFILE,
  getUserProfile,
  setUserProfile,
  type UserProfile,
} from "@/lib/profile-store";
import { syncProfileToSupabase } from "@/lib/profile-supabase";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  // Hydratation : lecture localStorage au montage client
  useEffect(() => {
    setProfile(getUserProfile());
    setReady(true);
  }, []);

  // Persistance : sauvegarde à chaque changement (après hydratation)
  useEffect(() => {
    if (!ready) return;
    setUserProfile(profile);
    syncProfileToSupabase(profile);
  }, [profile, ready]);

  /** Mise à jour partielle du profil (merge + persist). */
  const patch = (partial: Partial<UserProfile>) =>
    setProfile((prev) => ({ ...prev, ...partial }));

  return { profile, patch, ready } as const;
}
