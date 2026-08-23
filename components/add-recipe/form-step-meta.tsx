import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";

export function FormStepMeta({
  title,
  setTitle,
  prepTime,
  setPrepTime,
  cookTime,
  setCookTime,
  servings,
  setServings,
  calories,
  setCalories,
  proteins,
  setProteins,
  titleRef,
}: {
  title: string;
  setTitle: (val: string) => void;
  prepTime: string;
  setPrepTime: (val: string) => void;
  cookTime: string;
  setCookTime: (val: string) => void;
  servings: string;
  setServings: (val: string) => void;
  calories: string;
  setCalories: (val: string) => void;
  proteins: string;
  setProteins: (val: string) => void;
  titleRef: React.RefObject<HTMLInputElement | null>;
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
          placeholder="Ex : Poulet rôti aux herbes"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            PRÉPARATION
          </label>
          <input
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="15 min"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            CUISSON
          </label>
          <input
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            placeholder="20 min"
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
            KCAL / PORTION
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
            PROTÉINES / PORTION (g)
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
    </>
  );
}
