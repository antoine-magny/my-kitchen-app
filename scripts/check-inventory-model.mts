/**
 * Contrôle manuel du modèle de snapshot : identités canoniques, conversion des
 * quantités et fusion vers la liste de courses.
 * Usage : npx tsx scripts/check-inventory-model.mts
 */
import { describeIngredient, resolveIngredientId } from "@/lib/ingredients";
import { collectIngredientsFromDayOnward } from "@/lib/planning";
import { RECIPES } from "@/lib/recipes";
import { mergeIngredients, addShoppingItem } from "@/lib/shopping-list";
import { formatAmount, parseAmount } from "@/lib/units";

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
  icon: "1F41F",
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
console.log(
  `      ${exported.length} articles : ${exported
    .map((i) => `${i.customName} ${formatAmount(i.amount, i.unit)}`)
    .join(", ")}`,
);

console.log(failures === 0 ? "\nTous les contrôles passent." : `\n${failures} contrôle(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
