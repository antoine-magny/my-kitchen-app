import { ChevronDownIcon } from "@/components/icons";
import { RecipeTagPills } from "@/components/recipe-form/tag-pills";
import { inputClass, inputStyle, labelClass } from "@/components/recipe-form-styles";
import {
  DIFFICULTIES,
  RECIPE_COST_LABELS,
  RECIPE_COSTS,
  type RecipeCost,
  type RecipeDifficulty,
  type RecipeTag,
} from "@/lib/recipes";

type MetaBase = {
  titleRef: React.RefObject<HTMLInputElement | null>;
  title: string;
  setTitle: (val: string) => void;
  servings: string;
  setServings: (val: string) => void;
  calories: string;
  setCalories: (val: string) => void;
  proteins: string;
  setProteins: (val: string) => void;
  difficulty: RecipeDifficulty;
  setDifficulty: (val: RecipeDifficulty) => void;
  tags: RecipeTag[];
  setTags: (val: RecipeTag[]) => void;
  cost: RecipeCost;
  setCost: (val: RecipeCost) => void;
};

type SplitTimeMeta = MetaBase & {
  timeMode: "split";
  prepTime: string;
  setPrepTime: (val: string) => void;
  cookTime: string;
  setCookTime: (val: string) => void;
};

type SingleTimeMeta = MetaBase & {
  timeMode: "single";
  time: string;
  setTime: (val: string) => void;
};

export type RecipeMetaFieldsProps = SplitTimeMeta | SingleTimeMeta;

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} appearance-none pr-10`}
          style={inputStyle}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#7A8F7D]">
          <ChevronDownIcon size={14} />
        </span>
      </div>
    </div>
  );
}

function DifficultyCostFields({
  difficulty,
  setDifficulty,
  cost,
  setCost,
}: Pick<MetaBase, "difficulty" | "setDifficulty" | "cost" | "setCost">) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <SelectField
        label="DIFFICULTÉ"
        value={difficulty}
        onChange={(val) => setDifficulty(val as RecipeDifficulty)}
        options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
      />
      <SelectField
        label="COÛT"
        value={cost}
        onChange={(val) => setCost(val as RecipeCost)}
        options={RECIPE_COSTS.map((c) => ({ value: c, label: RECIPE_COST_LABELS[c] }))}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  inputRef,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  type?: "text" | "number";
  min?: string;
}) {
  return (
    <div>
      <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
        style={inputStyle}
      />
    </div>
  );
}

export function RecipeMetaFields(props: RecipeMetaFieldsProps) {
  const {
    titleRef,
    title,
    setTitle,
    servings,
    setServings,
    calories,
    setCalories,
    proteins,
    setProteins,
    difficulty,
    setDifficulty,
    tags,
    setTags,
    cost,
    setCost,
  } = props;

  return (
    <>
      <TextField
        label="TITRE"
        value={title}
        onChange={setTitle}
        placeholder={
          props.timeMode === "split"
            ? "Ex : Poulet rôti aux herbes"
            : "Ex : Salade de quinoa aux légumes"
        }
        inputRef={titleRef}
      />

      {props.timeMode === "split" ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <TextField
              label="PRÉPARATION"
              value={props.prepTime}
              onChange={props.setPrepTime}
              placeholder="15 min"
            />
            <TextField
              label="CUISSON"
              value={props.cookTime}
              onChange={props.setCookTime}
              placeholder="20 min"
            />
            <TextField
              label="PORTIONS"
              value={servings}
              onChange={setServings}
              type="number"
              min="1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="KCAL / PORTION"
              value={calories}
              onChange={setCalories}
              type="number"
              min="0"
            />
            <TextField
              label="PROTÉINES / PORTION (g)"
              value={proteins}
              onChange={setProteins}
              type="number"
              min="0"
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TextField
            label="TEMPS"
            value={props.time}
            onChange={props.setTime}
            placeholder="30 min"
          />
          <TextField
            label="PORTIONS"
            value={servings}
            onChange={setServings}
            type="number"
            min="1"
          />
          <TextField
            label="KCAL"
            value={calories}
            onChange={setCalories}
            type="number"
            min="0"
          />
          <TextField
            label="PROTÉINES (g)"
            value={proteins}
            onChange={setProteins}
            type="number"
            min="0"
          />
        </div>
      )}

      <DifficultyCostFields
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        cost={cost}
        setCost={setCost}
      />

      <div>
        <label className={labelClass} style={{ letterSpacing: "0.04em" }}>
          CATÉGORIES
        </label>
        <RecipeTagPills selected={tags} onChange={setTags} />
      </div>
    </>
  );
}
