import { ChevronDownIcon } from "@/components/icons";
import { RecipeTagPills } from "@/components/recipe-form/tag-pills";
import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";
import {
  DIFFICULTIES,
  RECIPE_COST_LABELS,
  RECIPE_COSTS,
  type RecipeCost,
  type RecipeTag,
} from "@/lib/recipes";

export function MetaSection({
  titleRef,
  title, setTitle,
  time, setTime,
  servings, setServings,
  calories, setCalories,
  proteins, setProteins,
  difficulty, setDifficulty,
  tags, setTags,
  cost, setCost,
}: {
  titleRef: React.RefObject<HTMLInputElement | null>;
  title: string; setTitle: (val: string) => void;
  time: string; setTime: (val: string) => void;
  servings: string; setServings: (val: string) => void;
  calories: string; setCalories: (val: string) => void;
  proteins: string; setProteins: (val: string) => void;
  difficulty: typeof DIFFICULTIES[number]; setDifficulty: (val: typeof DIFFICULTIES[number]) => void;
  tags: RecipeTag[]; setTags: (val: RecipeTag[]) => void;
  cost: RecipeCost; setCost: (val: RecipeCost) => void;
}) {
  return (
    <>
      <div>
        <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
          TITRE
        </label>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Salade de quinoa aux légumes"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            TEMPS
          </label>
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="30 min"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            PORTIONS
          </label>
          <input
            type="number"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            KCAL
          </label>
          <input
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            PROTÉINES (g)
          </label>
          <input
            type="number"
            min="0"
            value={proteins}
            onChange={(e) => setProteins(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            DIFFICULTÉ
          </label>
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof DIFFICULTIES[number])}
              className={`${inputClass} appearance-none pr-10`}
              style={inputStyle}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
              <ChevronDownIcon size={14} />
            </span>
          </div>
        </div>
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            COÛT
          </label>
          <div className="relative">
            <select
              value={cost}
              onChange={(e) => setCost(e.target.value as RecipeCost)}
              className={`${inputClass} appearance-none pr-10`}
              style={inputStyle}
            >
              {RECIPE_COSTS.map((c) => (
                <option key={c} value={c}>
                  {RECIPE_COST_LABELS[c]}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
              <ChevronDownIcon size={14} />
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
          CATÉGORIES
        </label>
        <RecipeTagPills selected={tags} onChange={setTags} />
      </div>
    </>
  );
}
