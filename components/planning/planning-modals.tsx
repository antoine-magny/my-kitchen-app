import { GenerateFromFridgeModal } from "@/components/generate-from-fridge-modal";
import { ExportShoppingModal } from "@/components/planning/export-shopping-modal";
import { SelectRecipeModal } from "@/components/select-recipe-modal";
import type { MealType } from "@/lib/meal-types";
import type { DayPlan, MealSlot, SelectedMealTarget } from "@/lib/planning";
import type { Recipe } from "@/lib/recipes";

export function PlanningModals({
  exportModalOpen,
  weekStart,
  weekPlans,
  onCloseExport,
  onConfirmExport,
  generateModalOpen,
  selectedDay,
  defaultMealType,
  onCloseGenerate,
  onGenerated,
  pickerSlot,
  currentPickerRecipeId,
  onSelectPickerRecipe,
  onClosePicker,
}: {
  exportModalOpen: boolean;
  weekStart: Date;
  weekPlans: Record<string, DayPlan>;
  onCloseExport: () => void;
  onConfirmExport: (selected: SelectedMealTarget[]) => void;
  generateModalOpen: boolean;
  selectedDay: Date;
  defaultMealType: MealType;
  onCloseGenerate: () => void;
  onGenerated: (payload: { dateIso: string; mealType: MealType; recipes: Recipe[] }) => void;
  pickerSlot: MealSlot | null;
  currentPickerRecipeId: number | null;
  onSelectPickerRecipe: (recipeId: number) => void;
  onClosePicker: () => void;
}) {
  return (
    <>
      {exportModalOpen && (
        <ExportShoppingModal
          weekStart={weekStart}
          weekPlans={weekPlans}
          onClose={onCloseExport}
          onConfirm={onConfirmExport}
        />
      )}

      {generateModalOpen && (
        <GenerateFromFridgeModal
          defaultDate={selectedDay}
          defaultMealType={defaultMealType}
          onClose={onCloseGenerate}
          onGenerated={onGenerated}
        />
      )}

      {pickerSlot && (
        <SelectRecipeModal
          slot={pickerSlot}
          currentRecipeId={currentPickerRecipeId}
          onSelect={onSelectPickerRecipe}
          onClose={onClosePicker}
        />
      )}
    </>
  );
}
