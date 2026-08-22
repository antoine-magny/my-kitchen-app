import { ChevronDownIcon } from "@/components/icons";
import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";
import { DIFFICULTIES, RECIPE_TAGS, type RecipeFilter } from "@/lib/recipes";

export function MetaSection({
  titleRef,
  title, setTitle,
  time, setTime,
  servings, setServings,
  calories, setCalories,
  proteins, setProteins,
  difficulty, setDifficulty,
  tag, setTag,
}: {
  titleRef: React.RefObject<HTMLInputElement | null>;
  title: string; setTitle: (val: string) => void;
  time: string; setTime: (val: string) => void;
  servings: string; setServings: (val: string) => void;
  calories: string; setCalories: (val: string) => void;
  proteins: string; setProteins: (val: string) => void;
  difficulty: typeof DIFFICULTIES[number]; setDifficulty: (val: typeof DIFFICULTIES[number]) => void;
  tag: Exclude<RecipeFilter, "Tout"> | ""; setTag: (val: Exclude<RecipeFilter, "Tout"> | "") => void;
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
            CATÉGORIE
          </label>
          <div className="relative">
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as Exclude<RecipeFilter, "Tout"> | "")}
              className={`${inputClass} appearance-none pr-10`}
              style={inputStyle}
            >
              <option value="">Aucune</option>
              {RECIPE_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
              <ChevronDownIcon size={14} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
