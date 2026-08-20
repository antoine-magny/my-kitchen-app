/**
 * Contrôle des fonctionnalités d'unités variables par ingrédient,
 * des ratios d'équivalence et du fallback par défaut en « piece ».
 * Usage : npx tsx scripts/check-units-and-ingredients.mts
 */
import {
  getIngredientCountUnit,
  getIngredientDefaultUnit,
  getIngredientEquivalence,
} from "@/lib/ingredients";
import {
  combineQuantities,
  DEFAULT_UNIT,
  formatAmount,
  normalizeUnit,
} from "@/lib/units";

let failures = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "OK  " : "FAIL"} ${label} → ${JSON.stringify(actual)}`);
  if (!ok) console.log(`      attendu : ${JSON.stringify(expected)}`);
}

console.log("\n--- 1. Unité par défaut (getIngredientDefaultUnit) ---");
check("Ail (catalogue)", getIngredientDefaultUnit("Ail"), "gousse");
check("Farine (catalogue)", getIngredientDefaultUnit("Farine"), "g");
check("Lait (catalogue)", getIngredientDefaultUnit("Lait"), "ml");
check("Huile (catalogue)", getIngredientDefaultUnit("Huile"), "c_soupe");
check("Citron (catalogue)", getIngredientDefaultUnit("Citron"), "piece");
check("Melon (détection mot-clé)", getIngredientDefaultUnit("Melon charentais"), "tranche");
check("Aliment inconnu → fallback piece", getIngredientDefaultUnit("AlimentInconnuXYZ"), "piece");
check("Chaîne vide → fallback piece", getIngredientDefaultUnit(""), "piece");

console.log("\n--- 2. Unité variable de décompte (getIngredientCountUnit) ---");
check("Ail → gousse", getIngredientCountUnit("Ail"), "gousse");
check("Melon → tranche", getIngredientCountUnit("Melon"), "tranche");
check("Basilic → feuille", getIngredientCountUnit("Basilic frais"), "feuille");
check("Thym → brin", getIngredientCountUnit("Thym"), "brin");
check("Sel → pincee", getIngredientCountUnit("Sel"), "pincee");
check("Pomme → piece", getIngredientCountUnit("Pomme"), "piece");
check("Aliment inconnu → piece", getIngredientCountUnit("Poudre magique"), "piece");

console.log("\n--- 3. Ratios d'équivalence (getIngredientEquivalence) ---");
check("Ail (1 gousse = 5g)", getIngredientEquivalence("Ail")?.gramsPerCountUnit, 5);
check("Melon (1 tranche = 150g)", getIngredientEquivalence("Melon")?.gramsPerCountUnit, 150);
check("Pain (1 tranche = 35g)", getIngredientEquivalence("Pain")?.gramsPerCountUnit, 35);

console.log("\n--- 4. Normalisation d'unités & Fallback (normalizeUnit) ---");
check("DEFAULT_UNIT vaut piece", DEFAULT_UNIT, "piece");
check("gousse reste gousse", normalizeUnit("gousse"), "gousse");
check("tranches devient tranche", normalizeUnit("tranches"), "tranche");
check("Unité inconnue → piece", normalizeUnit("inconnue_totalement"), "piece");
check("null → piece", normalizeUnit(null), "piece");

console.log("\n--- 5. Fusion intelligente (combineQuantities) ---");
// Fusion simple même unité
check(
  "Masse : 150g + 250g = 400g",
  combineQuantities(150, "g", 250, "g"),
  { amount: 400, unit: "g" },
);
check(
  "Décompte : 2 gousses + 1 gousse = 3 gousses",
  combineQuantities(2, "gousse", 1, "gousse"),
  { amount: 3, unit: "gousse" },
);

// Fusion transversale via équivalence
check(
  "Ail : 10g + 1 gousse = 3 gousses (10g / 5g = 2 + 1)",
  combineQuantities(10, "g", 1, "gousse", "Ail"),
  { amount: 3, unit: "gousse" },
);
check(
  "Ail : 2 gousses + 15g = 5 gousses (2 + 15g / 5g = 5)",
  combineQuantities(2, "gousse", 15, "g", "Ail"),
  { amount: 5, unit: "gousse" },
);
check(
  "Melon : 300g + 1 tranche = 3 tranches (300g / 150g = 2 + 1)",
  combineQuantities(300, "g", 1, "tranche", "Melon"),
  { amount: 3, unit: "tranche" },
);

console.log("\n--- 6. Formatage ---");
check("Format 3 gousses", formatAmount(3, "gousse"), "3 gousses");
check("Format 1 gousse", formatAmount(1, "gousse"), "1 gousse");
check("Format 2 tranches", formatAmount(2, "tranche"), "2 tranches");
check("Format 5 pièces", formatAmount(5, "piece"), "5");

console.log(failures === 0 ? "\n✅ Tous les tests passent avec succès !" : `\n❌ ${failures} test(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
