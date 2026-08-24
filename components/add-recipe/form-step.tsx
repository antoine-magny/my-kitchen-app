import { FormStepFooter } from "@/components/add-recipe/form-step-footer";
import { FormStepIngredients } from "@/components/add-recipe/form-step-ingredients";
import { FormStepInstructions } from "@/components/add-recipe/form-step-instructions";
import { FormStepMeta } from "@/components/add-recipe/form-step-meta";
import type { RecipeFormIngredientRow } from "@/lib/recipe-import";
import type { RecipeCost, RecipeDifficulty, RecipeTag } from "@/lib/recipes";

export function FormStep({
  title, setTitle,
  prepTime, setPrepTime,
  cookTime, setCookTime,
  servings, setServings,
  calories, setCalories,
  proteins, setProteins,
  difficulty, setDifficulty,
  tags, setTags,
  cost, setCost,
  ingredients, setIngredients, updateIngredient,
  instructions, setInstructions,
  importPhotoDataUrl,
  error, saving, onSubmit, titleRef
}: {
  title: string; setTitle: (val: string) => void;
  prepTime: string; setPrepTime: (val: string) => void;
  cookTime: string; setCookTime: (val: string) => void;
  servings: string; setServings: (val: string) => void;
  calories: string; setCalories: (val: string) => void;
  proteins: string; setProteins: (val: string) => void;
  difficulty: RecipeDifficulty; setDifficulty: (val: RecipeDifficulty) => void;
  tags: RecipeTag[]; setTags: (val: RecipeTag[]) => void;
  cost: RecipeCost; setCost: (val: RecipeCost) => void;
  ingredients: RecipeFormIngredientRow[];
  setIngredients: (updater: (prev: RecipeFormIngredientRow[]) => RecipeFormIngredientRow[]) => void;
  updateIngredient: (index: number, field: keyof RecipeFormIngredientRow, value: string) => void;
  instructions: string[];
  setInstructions: (updater: (prev: string[]) => string[]) => void;
  importPhotoDataUrl: string | null;
  error: string;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  titleRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {importPhotoDataUrl && (
          <div className="overflow-hidden rounded-2xl" style={{ border: "1.5px solid #E2EBE3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={importPhotoDataUrl} alt="Source scannée" className="h-36 w-full object-cover" />
          </div>
        )}

        <FormStepMeta
          title={title}
          setTitle={setTitle}
          prepTime={prepTime}
          setPrepTime={setPrepTime}
          cookTime={cookTime}
          setCookTime={setCookTime}
          servings={servings}
          setServings={setServings}
          calories={calories}
          setCalories={setCalories}
          proteins={proteins}
          setProteins={setProteins}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          tags={tags}
          setTags={setTags}
          cost={cost}
          setCost={setCost}
          titleRef={titleRef}
        />

        <FormStepIngredients
          ingredients={ingredients}
          setIngredients={setIngredients}
          updateIngredient={updateIngredient}
        />

        <FormStepInstructions
          instructions={instructions}
          setInstructions={setInstructions}
        />
      </div>

      <FormStepFooter error={error} saving={saving} />
    </form>
  );
}
