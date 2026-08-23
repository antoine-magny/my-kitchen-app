import { resolveIngredientId, resolveIcon, getIngredientDefaultUnit, getIngredientCountUnit } from "../lib/ingredients";

interface TestCase {
  input: string;
  expectedId: string;
  expectedIcon: string;
  expectedDefaultUnit: string;
}

const TEST_CASES: TestCase[] = [
  { input: "Mozarella", expectedId: "ing_mozzarella", expectedIcon: "1F9C0", expectedDefaultUnit: "piece" },
  { input: "mozarella", expectedId: "ing_mozzarella", expectedIcon: "1F9C0", expectedDefaultUnit: "piece" },
  { input: "mozzarella", expectedId: "ing_mozzarella", expectedIcon: "1F9C0", expectedDefaultUnit: "piece" },
  { input: "MOZZARELLA", expectedId: "ing_mozzarella", expectedIcon: "1F9C0", expectedDefaultUnit: "piece" },
  { input: "Courgete", expectedId: "ing_courgette", expectedIcon: "1F952", expectedDefaultUnit: "piece" },
  { input: "Carote", expectedId: "ing_carotte", expectedIcon: "1F955", expectedDefaultUnit: "piece" },
  { input: "Echalotte", expectedId: "ing_echalote", expectedIcon: "1F9C5", expectedDefaultUnit: "gousse" },
  { input: "champinion", expectedId: "ing_champignon", expectedIcon: "1F344", expectedDefaultUnit: "piece" },
  { input: "pamplemous", expectedId: "ing_pamplemousse", expectedIcon: "1F34A", expectedDefaultUnit: "piece" },
  { input: "ciboulete", expectedId: "ing_ciboulette", expectedIcon: "1F33F", expectedDefaultUnit: "brin" },
  { input: "boule de mozarella", expectedId: "ing_mozzarella", expectedIcon: "1F9C0", expectedDefaultUnit: "piece" },
  { input: "tranches de jombom blanc", expectedId: "ing_jambon_blanc", expectedIcon: "1F953", expectedDefaultUnit: "tranche" },
  { input: "Pave de saumon", expectedId: "ing_pave_de_saumon", expectedIcon: "1F41F", expectedDefaultUnit: "piece" },
  { input: "Gousse d ail", expectedId: "ing_ail", expectedIcon: "1F9C4", expectedDefaultUnit: "gousse" },
  { input: "Huile d'olive", expectedId: "ing_huile_d_olive", expectedIcon: "1FAD2", expectedDefaultUnit: "c_soupe" },
  { input: "Granola", expectedId: "ing_granola", expectedIcon: "1F963", expectedDefaultUnit: "g" },
  { input: "Beurre AOP", expectedId: "ing_beurre", expectedIcon: "1F9C8", expectedDefaultUnit: "g" },
  { input: "Lait demi-écrémé", expectedId: "ing_lait", expectedIcon: "1F95B", expectedDefaultUnit: "ml" },
  { input: "Pâtes linguine", expectedId: "ing_pates", expectedIcon: "1F35D", expectedDefaultUnit: "g" },
  { input: "Riz basmati", expectedId: "ing_riz", expectedIcon: "1F35A", expectedDefaultUnit: "g" },
  { input: "Farine", expectedId: "ing_farine", expectedIcon: "1F33E", expectedDefaultUnit: "g" },
  { input: "Chocolat noir 70%", expectedId: "ing_chocolat", expectedIcon: "1F36B", expectedDefaultUnit: "g" },
];

console.log("=== Test de correction orthographique intelligente ===");

let passed = 0;
let failed = 0;

for (const t of TEST_CASES) {
  const id = resolveIngredientId(t.input);
  const icon = resolveIcon(t.input);
  const unit = getIngredientDefaultUnit(t.input);

  const ok = id === t.expectedId && unit === t.expectedDefaultUnit && icon === t.expectedIcon;
  if (ok) {
    console.log(`OK   « ${t.input} » → ${id} (${icon}) [unit: ${unit}]`);
    passed++;
  } else {
    console.error(`FAIL « ${t.input} » → obtenu ${id} (${icon}) [unit: ${unit}], attendu ${t.expectedId} (${t.expectedIcon}) [unit: ${t.expectedDefaultUnit}]`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n❌ ${failed} test(s) en échec.`);
  process.exit(1);
} else {
  console.log(`\n✅ Tous les tests (${passed}/${passed}) passent avec succès !`);
}
