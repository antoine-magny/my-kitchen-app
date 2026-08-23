import { resolveIngredientId, resolveIcon, getIngredientDefaultUnit, getIngredientCountUnit } from "../lib/ingredients";

interface TestCase {
  input: string;
  expectedId: string;
  expectedIcon: string;
  expectedDefaultUnit: string;
}

const TEST_CASES: TestCase[] = [
  { input: "Mozarella", expectedId: "ing_mozzarella", expectedIcon: "🧀", expectedDefaultUnit: "piece" },
  { input: "mozarella", expectedId: "ing_mozzarella", expectedIcon: "🧀", expectedDefaultUnit: "piece" },
  { input: "mozzarella", expectedId: "ing_mozzarella", expectedIcon: "🧀", expectedDefaultUnit: "piece" },
  { input: "MOZZARELLA", expectedId: "ing_mozzarella", expectedIcon: "🧀", expectedDefaultUnit: "piece" },
  { input: "Courgete", expectedId: "ing_courgette", expectedIcon: "🥒", expectedDefaultUnit: "piece" },
  { input: "Carote", expectedId: "ing_carotte", expectedIcon: "🥕", expectedDefaultUnit: "piece" },
  { input: "Echalotte", expectedId: "ing_echalote", expectedIcon: "🧅", expectedDefaultUnit: "gousse" },
  { input: "champinion", expectedId: "ing_champignon", expectedIcon: "🍄", expectedDefaultUnit: "piece" },
  { input: "pamplemous", expectedId: "ing_pamplemousse", expectedIcon: "🍊", expectedDefaultUnit: "piece" },
  { input: "ciboulete", expectedId: "ing_ciboulette", expectedIcon: "🌿", expectedDefaultUnit: "brin" },
  { input: "boule de mozarella", expectedId: "ing_mozzarella", expectedIcon: "🧀", expectedDefaultUnit: "piece" },
  { input: "tranches de jombom blanc", expectedId: "ing_jambon_blanc", expectedIcon: "🥓", expectedDefaultUnit: "tranche" },
  { input: "Pave de saumon", expectedId: "ing_pave_de_saumon", expectedIcon: "🐟", expectedDefaultUnit: "piece" },
  { input: "Gousse d ail", expectedId: "ing_ail", expectedIcon: "🧄", expectedDefaultUnit: "gousse" },
  { input: "Huile d'olive", expectedId: "ing_huile_d_olive", expectedIcon: "🫒", expectedDefaultUnit: "c_soupe" },
  { input: "Granola", expectedId: "ing_granola", expectedIcon: "🥣", expectedDefaultUnit: "g" },
  { input: "Beurre AOP", expectedId: "ing_beurre", expectedIcon: "🧈", expectedDefaultUnit: "g" },
  { input: "Lait demi-écrémé", expectedId: "ing_lait", expectedIcon: "🥛", expectedDefaultUnit: "ml" },
  { input: "Pâtes linguine", expectedId: "ing_pates", expectedIcon: "🍝", expectedDefaultUnit: "g" },
  { input: "Riz basmati", expectedId: "ing_riz", expectedIcon: "🍚", expectedDefaultUnit: "g" },
  { input: "Farine", expectedId: "ing_farine", expectedIcon: "🌾", expectedDefaultUnit: "g" },
  { input: "Chocolat noir 70%", expectedId: "ing_chocolat", expectedIcon: "🍫", expectedDefaultUnit: "g" },
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
