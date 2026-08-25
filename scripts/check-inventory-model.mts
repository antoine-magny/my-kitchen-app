/**
 * Contrôle manuel du modèle de snapshot : identités canoniques, conversion des
 * quantités et fusion vers la liste de courses.
 * Usage : npx tsx scripts/check-inventory-model.mts
 */
import { describeIngredient, resolveIngredientId } from "@/lib/ingredients";
import { matchesInventoryIdentity } from "@/lib/inventory-match";
import { matchRecipeIngredientsWithFridge } from "@/lib/consume-recipe";
import { dayKey, startOfWeek } from "@/lib/date-paris";
import {
  collectIngredientsFromDayOnward,
  collectIngredientsFromSelectedMeals,
  toIsoDateFromPlanningKey,
  withCurrentWeekSeed,
} from "@/lib/planning";
import { RECIPES } from "@/lib/recipes";
import { ing } from "@/lib/recipe-model";
import { mergeIngredients, addShoppingItem } from "@/lib/shopping-list";
import { formatAmount, parseAmount } from "@/lib/units";
import type { FridgeItem } from "@/types/inventory";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "OK  " : "FAIL"} ${label} → ${JSON.stringify(actual)}`);
  if (!ok) console.log(`      attendu : ${JSON.stringify(expected)}`);
}

console.log("\n--- Conversion des quantités écrites ---");
check("« 150 g »", parseAmount("150 g"), { amount: 150, unit: "g" });
check("« 20 cl »", parseAmount("20 cl"), { amount: 20, unit: "cl" });
check("« 2 c.à.s »", parseAmount("2 c.à.s"), { amount: 2, unit: "c_soupe" });
check("« 3 gousses »", parseAmount("3 gousses"), { amount: 3, unit: "gousse" });
check("« 10 feuilles »", parseAmount("10 feuilles"), { amount: 10, unit: "feuille" });
check("« 1/2 »", parseAmount("1/2"), { amount: 0.5, unit: "piece" });
check("« q.s. »", parseAmount("q.s."), { amount: 0, unit: "qs" });
check("« Quantité suffisante »", parseAmount("Quantité suffisante"), { amount: 0, unit: "qs" });
check("« quelques brins »", parseAmount("quelques brins"), { amount: 0, unit: "qs" });
check("« 1 pot »", parseAmount("1 pot"), { amount: 1, unit: "piece" });

console.log("\n--- Affichage ---");
check("400 g", formatAmount(400, "g"), "400 g");
check("1500 g", formatAmount(1500, "g"), "1,5 kg");
check("200 ml", formatAmount(200, "ml"), "20 cl");
check("0 qs", formatAmount(0, "qs"), "Quantité suffisante");
check("3 gousse", formatAmount(3, "gousse"), "3 gousses");
check("1 gousse", formatAmount(1, "gousse"), "1 gousse");
check("0,5 piece", formatAmount(0.5, "piece"), "1/2");

console.log("\n--- Identités canoniques ---");
check("Tomate", resolveIngredientId("Tomate"), "ing_tomate");
check("Tomates (pluriel)", resolveIngredientId("Tomates"), "ing_tomate");
check("Œufs", resolveIngredientId("Œufs"), "ing_oeuf");
check("Tomates cerises ≠ Tomate", resolveIngredientId("Tomates cerises"), "ing_tomate_cerise");
check("Concombre ≠ Courgette", [
  resolveIngredientId("Concombre"),
  resolveIngredientId("Courgette"),
], ["ing_concombre", "ing_courgette"]);
check("Citron identique entre recettes", [
  resolveIngredientId("Citron"),
  resolveIngredientId("Citrons"),
], ["ing_citron", "ing_citron"]);

console.log("\n--- Rayon + icône dérivés ---");
const lardonShop = addShoppingItem({
  customName: "Lardons fumés",
  amount: 2,
  unit: "piece",
  icon: "1F953", // hardcoded 🥓
});
console.log("Rayon lardons :", lardonShop[1]?.category); // "proteins" attendu
const pouletShop = addShoppingItem({
  customName: "Pilons de poulet",
  amount: 4,
  unit: "piece",
  icon: "1F357", // hardcoded 🍗
});
check("Pavés de saumon", describeIngredient("Pavés de saumon"), {
  ingredientId: "ing_pave_de_saumon",
  name: "Pavés de saumon",
  category: "laitiers_viandes_poisson",
  icon: "🐟",
});

console.log("\n--- Recettes seed converties ---");
const seedIssues = RECIPES.flatMap((recipe) =>
  recipe.ingredients
    .filter((i) => !i.ingredientId || !i.category || (i.unit !== "qs" && i.amount <= 0))
    .map((i) => `${recipe.title} → ${i.name}`),
);
check("aucun ingrédient seed incomplet", seedIssues, []);
console.log(
  `      ${RECIPES.reduce((n, r) => n + r.ingredients.length, 0)} ingrédients sur ${RECIPES.length} recettes`,
);

console.log("\n--- Fusion vers la liste de courses ---");
const merged = mergeIngredients([
  ...RECIPES[1].ingredients, // Tomates cerises 150 g, Huile d'olive 3 c.à.s, Citron 1
  ...RECIPES[2].ingredients, // Tomates cerises 250 g, Huile d'olive 2 c.à.s, Fleur de sel q.s.
]);
const tomatoes = merged.filter((i) => i.ingredientId === "ing_tomate_cerise");
check(
  "tomates cerises fusionnées (150 + 250)",
  tomatoes.map((i) => `${i.customName} ${formatAmount(i.amount, i.unit)}`),
  ["Tomates cerises 400 g"],
);
const oil = merged.filter((i) => i.ingredientId === "ing_huile_d_olive");
check(
  "huile d'olive fusionnée (3 + 2 c.à.s)",
  oil.map((i) => formatAmount(i.amount, i.unit)),
  ["75 ml"],
);
check(
  "articles cochables et horodatés",
  merged.every((i) => i.isChecked === false && typeof i.createdAt === "string"),
  true,
);

console.log("\n--- Export planning → courses ---");
const monday = new Date(Date.UTC(2026, 7, 10, 12));
const plans = {
  "2026-7-10": { breakfast: null, lunchId: 6, dinnerId: 2 },
  "2026-7-11": { breakfast: null, lunchId: 3, dinnerId: null },
};
const exported = mergeIngredients(
  collectIngredientsFromDayOnward(monday, monday, plans, {}),
);
check(
  "export non vide et sans doublon d'identité+unité",
  exported.length > 0 &&
    new Set(exported.map((i) => `${i.ingredientId}|${i.unit}`)).size === exported.length,
  true,
);
check(
  "export tamponne plannedMeals en ISO",
  exported.every(
    (i) =>
      (i.plannedMeals?.length ?? 0) > 0 &&
      i.plannedMeals!.every((m) => /^\d{4}-\d{2}-\d{2}$/.test(m.date)),
  ),
  true,
);
console.log(
  `      ${exported.length} articles : ${exported
    .map((i) => `${i.customName} ${formatAmount(i.amount, i.unit)}`)
    .join(", ")}`,
);

console.log("\n--- Traçabilité plannedMeals / dates ISO ---");
check("dayKey août → ISO", toIsoDateFromPlanningKey("2026-7-28"), "2026-08-28");
check("ISO déjà canonique", toIsoDateFromPlanningKey("2026-08-28"), "2026-08-28");
check("dayKey janvier (mois 0)", toIsoDateFromPlanningKey("2026-0-5"), "2026-01-05");

const selectedExported = collectIngredientsFromSelectedMeals(
  [
    { date: "2026-7-10", mealType: "lunch" },
    { date: "2026-7-10", mealType: "lunch" },
    { date: "2026-7-10", mealType: "dinner" },
  ],
  plans,
);
check(
  "ingrédients exportés portent plannedMeals",
  selectedExported.length > 0 && selectedExported.every((i) => i.plannedMeals?.length === 1),
  true,
);
check(
  "date ISO (pas dayKey) sur l'ingrédient",
  selectedExported[0]?.plannedMeals?.[0]?.date,
  "2026-08-10",
);
check(
  "créneau conservé",
  selectedExported[0]?.plannedMeals?.[0]?.mealType,
  "lunch",
);

const withMeals = [
  {
    ingredientId: "ing_tomate",
    name: "Tomate",
    amount: 100,
    unit: "g" as const,
    category: "fruits_legumes" as const,
    plannedMeals: [
      { recipeTitle: "Midi", date: "2026-08-12", mealType: "lunch" as const },
    ],
  },
  {
    ingredientId: "ing_tomate",
    name: "Tomate",
    amount: 50,
    unit: "g" as const,
    category: "fruits_legumes" as const,
    plannedMeals: [
      { recipeTitle: "Soir", date: "2026-08-10", mealType: "dinner" as const },
      { recipeTitle: "Soir", date: "2026-08-10", mealType: "dinner" as const },
    ],
  },
];
const fused = mergeIngredients(withMeals);
check("fusion additionne les quantités", fused[0]?.amount, 150);
check("fusion déduplique plannedMeals", fused[0]?.plannedMeals?.length, 2);
check("targetDate = date la plus proche", fused[0]?.targetDate, "2026-08-10");

console.log("\n--- Matching identité (courses / frigo / conso) ---");
check(
  "même ingredientId",
  matchesInventoryIdentity(
    { ingredientId: "ing_tomate", name: "Tomate" },
    { ingredientId: "ing_tomate", name: "Tomates cerises" },
  ),
  true,
);
check(
  "poulet fermier ≠ hauts de cuisse (token poulet)",
  matchesInventoryIdentity(
    { name: "Poulet fermier" },
    { name: "Hauts de cuisse de poulet" },
  ),
  false,
);

const cuisse = ing("Hauts de cuisse de poulet", 4, "piece");
const fridgePoulet: FridgeItem = {
  id: "f-poulet",
  customName: "Poulet fermier",
  amount: 500,
  unit: "g",
  category: "fridge",
  addedAt: "2026-08-26T00:00:00.000Z",
  ingredientId: "ing_filet_poulet",
};
const matchPoulet = matchRecipeIngredientsWithFridge([cuisse], [fridgePoulet]);
check("conso : poulet fermier (g) ne matche pas hauts de cuisse", matchPoulet.unmatched.length, 1);
check("conso : aucune déduction silencieuse", matchPoulet.deductions.length, 0);

const fridgeCuisse: FridgeItem = {
  id: "f-cuisse",
  customName: "Hauts de cuisse de poulet",
  amount: 4,
  unit: "piece",
  category: "fridge",
  addedAt: "2026-08-26T00:00:00.000Z",
  ingredientId: cuisse.ingredientId,
};
const matchOk = matchRecipeIngredientsWithFridge([cuisse], [fridgeCuisse]);
check("conso : même id + unité compatible", matchOk.deductions[0]?.amountToDeduct, 4);

const todaySeed = new Date(Date.UTC(2026, 7, 26, 12));
const weekId = dayKey(startOfWeek(todaySeed));
const dayId = dayKey(todaySeed);
const seededWeek = withCurrentWeekSeed({}, todaySeed);
check("seed ajoute la semaine absente", Object.prototype.hasOwnProperty.call(seededWeek, weekId), true);
const alreadySaved = {
  [weekId]: { [dayId]: { breakfast: null, lunchId: null, dinnerId: null } },
};
check(
  "seed n'écrase pas une semaine déjà sauvée",
  withCurrentWeekSeed(alreadySaved, todaySeed)[weekId]?.[dayId]?.lunchId,
  null,
);

console.log(failures === 0 ? "\nTous les contrôles passent." : `\n${failures} contrôle(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
