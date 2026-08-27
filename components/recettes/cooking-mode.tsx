"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, XIcon, CheckIcon } from "@/components/icons";
import { CookingTimer } from "@/components/recettes/cooking-timer";
import { parseMinutes } from "@/lib/recipe-time";
import type { Recipe } from "@/lib/recipes";
import { getFridgeItems, setFridgeItems } from "@/lib/fridge";
import { normalizeProductName } from "@/lib/shopping-categories";
import { combineQuantities } from "@/lib/units";

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export function CookingMode({ recipe, onClose }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set(recipe.ingredients.map((_, i) => i))
  );

  useEffect(() => {
    setMounted(true);
    // Empêcher le scroll du body quand le mode cuisine est ouvert
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isOverview = stepIndex === -1;
  const isBonAppetit = stepIndex === recipe.steps.length;
  const isInventoryUpdate = stepIndex > recipe.steps.length;
  const isFinished = isBonAppetit || isInventoryUpdate;
  
  const currentStep = !isOverview && !isFinished ? recipe.steps[stepIndex] : null;
  const durationMinutes = currentStep?.duration ? parseMinutes(currentStep.duration) : null;

  // Filtrer si le minuteur est pertinent (cuire, mijoter, reposer, etc.)
  const isTimerRelevant = currentStep
    ? /cuir|cuiss|four|mijoter|reposer|frais|frigo|marin|bouill|dorer|saisir|revenir/i.test(
        currentStep.title + " " + currentStep.detail
      )
    : false;

  const handleNext = () => setStepIndex((prev) => prev + 1);
  const handlePrev = () => setStepIndex((prev) => Math.max(-1, prev - 1));

  const handleFinish = () => {
    const fridge = getFridgeItems();
    const updatedFridge = [...fridge];

    for (const i of checkedIngredients) {
      const ing = recipe.ingredients[i];
      const cleanName = normalizeProductName(ing.name);
      
      const fridgeIndex = updatedFridge.findIndex(fi => 
        (ing.ingredientId && fi.ingredientId === ing.ingredientId) || 
        normalizeProductName(fi.customName) === cleanName
      );

      if (fridgeIndex !== -1) {
        const fi = updatedFridge[fridgeIndex];
        if (ing.amount > 0) {
          const combined = combineQuantities(fi.amount, fi.unit, -ing.amount, ing.unit, ing.ingredientId || cleanName);
          if (combined && combined.amount > 0) {
            updatedFridge[fridgeIndex] = { ...fi, amount: combined.amount, unit: combined.unit };
          } else {
            updatedFridge.splice(fridgeIndex, 1);
          }
        } else {
          updatedFridge.splice(fridgeIndex, 1);
        }
      }
    }
    
    setFridgeItems(updatedFridge);
    onClose();
  };

  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#111A13] text-white overflow-hidden animate-in fade-in duration-300">
      {/* Background Image (blurred) for overview */}
      {isOverview && (
        <div className="absolute inset-0 z-0">
          <Image
            src={recipe.photo}
            alt={recipe.title}
            fill
            className="object-cover opacity-20 blur-xl scale-110"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111A13] via-[#111A13]/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 pt-safe">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
          aria-label="Fermer le mode cuisine"
        >
          <XIcon size={20} />
        </button>
        {!isOverview && !isFinished && (
          <div className="text-sm font-bold tracking-widest text-[#A3B8A8] uppercase">
            Étape {stepIndex + 1} / {recipe.steps.length}
          </div>
        )}
        <div className="h-10 w-10" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 pb-32 pt-6">
        {isOverview && (
          <div className="flex flex-col max-w-2xl mx-auto w-full py-8">
            <h1 className="mb-4 text-center font-lora text-4xl font-bold leading-tight sm:text-5xl text-balance">
              {recipe.title}
            </h1>
            <p className="mb-12 text-center text-lg text-[#A3B8A8]">
              Préparez ces ingrédients avant de commencer :
            </p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl shadow-inner">
                    {ing.icon}
                  </div>
                  <div>
                    <p className="font-bold">{ing.name}</p>
                    <p className="text-sm text-[#A3B8A8]">
                      {ing.amount > 0 ? `${ing.amount} ${ing.unit}` : "Quantité suffisante"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep && (
          <div className="flex h-full flex-col justify-center max-w-3xl mx-auto w-full text-center">
            <h2 className="mb-6 font-lora text-3xl sm:text-4xl font-bold text-[#EBF2EC] text-balance">
              {currentStep.title}
            </h2>
            <p className="mb-12 text-xl sm:text-2xl leading-relaxed text-[#A3B8A8] text-balance">
              {currentStep.detail}
            </p>

            {durationMinutes != null && durationMinutes > 0 && isTimerRelevant && (
              <div className="mt-8">
                <CookingTimer durationMinutes={durationMinutes} />
              </div>
            )}
          </div>
        )}

        {isBonAppetit && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#4A7C59]">
              <CheckIcon size={48} strokeWidth={3} className="text-white" />
            </div>
            <h2 className="mb-4 font-lora text-4xl font-bold text-white text-balance">Bon appétit !</h2>
            <p className="text-lg text-[#A3B8A8]">Vous avez terminé la recette.</p>
          </div>
        )}

        {isInventoryUpdate && (
          <div className="flex flex-col max-w-2xl mx-auto w-full py-8">
            <h1 className="mb-4 text-center font-lora text-4xl font-bold leading-tight sm:text-5xl text-balance">
              Mise à jour du frigo
            </h1>
            <p className="mb-12 text-center text-lg text-[#A3B8A8]">
              Décochez les ingrédients que vous n'avez pas utilisés en entier pour les garder dans votre inventaire.
            </p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {recipe.ingredients.map((ing, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = new Set(checkedIngredients);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    setCheckedIngredients(next);
                  }}
                  className={`flex items-center gap-4 rounded-2xl p-4 backdrop-blur text-left transition-all ${
                    checkedIngredients.has(i) ? "bg-[#4A7C59]/20 border-2 border-[#4A7C59] shadow-[0_0_15px_rgba(74,124,89,0.2)]" : "bg-white/5 border-2 border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-inner transition-colors ${
                    checkedIngredients.has(i) ? "bg-[#4A7C59]" : "bg-white/10"
                  }`}>
                    {checkedIngredients.has(i) ? <CheckIcon size={24} strokeWidth={3} className="text-white" /> : ing.icon}
                  </div>
                  <div>
                    <p className={`font-bold ${checkedIngredients.has(i) ? "text-white" : "text-[#A3B8A8]"}`}>{ing.name}</p>
                    <p className={`text-sm ${checkedIngredients.has(i) ? "text-[#EBF2EC]" : "text-[#7A8F7D]"}`}>
                      {ing.amount > 0 ? `${ing.amount} ${ing.unit}` : "Quantité suffisante"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer / Navigation */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex h-28 items-center justify-between bg-gradient-to-t from-[#111A13] via-[#111A13]/90 to-transparent px-6 pb-safe">
        {isOverview ? (
          <div className="w-full max-w-md mx-auto">
            <button
              onClick={handleNext}
              className="flex w-full items-center justify-center rounded-2xl bg-[#4A7C59] py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              C'est parti !
            </button>
          </div>
        ) : (
          <div className="flex w-full max-w-4xl mx-auto items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="flex h-16 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 font-bold backdrop-blur transition-colors hover:bg-white/20"
            >
              <ChevronLeftIcon size={20} />
              <span className="hidden sm:inline">Précédent</span>
            </button>
            <button
              onClick={isInventoryUpdate ? handleFinish : handleNext}
              className="flex h-16 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#4A7C59] font-bold shadow-[0_4px_20px_rgba(74,124,89,0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isInventoryUpdate ? (
                <span>Terminer</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronRightIcon size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </footer>
    </div>
  );

  return createPortal(content, document.body);
}
