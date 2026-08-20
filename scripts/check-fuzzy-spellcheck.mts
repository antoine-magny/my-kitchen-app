import { resolveIngredientId, resolveEmoji, getIngredientDefaultUnit, getIngredientCountUnit } from "../lib/ingredients";

interface TestCase {
  input: string;
  expectedId: string;
  expectedEmoji: string;
  expectedDefaultUnit: string;
}

const TEST_CASES: TestCase[] = [
  { input: "Mozarella", expectedId: "ing_mozzarella", expectedEmoji: "🧀", expectedDefaultUnit: "piece" },
  { input: "mozarella", expectedId: "ing_mozzarella", expectedEmoji: "🧀", expectedDefaultUnit: "piece" },
  { input: "mozzarella", expectedId: "ing_mozzarella", expectedEmoji: "🧀", expectedDefaultUnit: "piece" },
  { input: "MOZZARELLA", expectedId: "ing_mozzarella", expectedEmoji: "🧀", expectedDefaultUnit: "piece" },
  { input: "Courgete", expectedId: "ing_courgette", expectedEmoji: "🥒", expectedDefaultUnit: "piece" },
  { input: "Carote", expectedId: "ing_carotte", expectedEmoji: "🥕", expectedDefaultUnit: "piece" },
  { input: "Echalotte", expectedId: "ing_echalote", expectedEmoji: "🧅", expectedDefaultUnit: "gousse" },
  { input: "champinion", expectedId: "ing_champignon", expectedEmoji: "🍄", expectedDefaultUnit: "piece" },
  { input: "pamplemous", expectedId: "ing_pamplemousse", expectedEmoji: "🍊", expectedDefaultUnit: "piece" },
  { input: "ciboulete", expectedId: "ing_ciboulette", expectedEmoji: "🌿", expectedDefaultUnit: "brin" },
  { input: "boule de mozarella", expectedId: "ing_mozzarella", expectedEmoji: "🧀", expectedDefaultUnit: "piece" },
  { input: "tranches de jombom blanc", expectedId: "ing_jambon_blanc", expectedEmoji: "🥓", expectedDefaultUnit: "tranche" },
  { input: "Pave de saumon", expectedId: "ing_pave_de_saumon", expectedEmoji: "🐟", expectedDefaultUnit: "piece" },
  { input: "Gousse d ail", expectedId: "ing_ail", expectedEmoji: "🧄", expectedDefaultUnit: "gousse" },
];

console.log("=== Test de correction orthographique intelligente ===");

let passed = 0;
let failed = 0;

for (const t of TEST_CASES) {
  const id = resolveIngredientId(t.input);
  const emoji = resolveEmoji(t.input);
  const unit = getIngredientDefaultUnit(t.input);

  const ok = id === t.expectedId && unit === t.expectedDefaultUnit;
  if (ok) {
    console.log(`OK   « ${t.input} » → ${id} (${emoji}) [unit: ${unit}]`);
    passed++;
  } else {
    console.error(`FAIL « ${t.input} » → obtenu ${id} [unit: ${unit}], attendu ${t.expectedId} [unit: ${t.expectedDefaultUnit}]`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n❌ ${failed} test(s) en échec.`);
  process.exit(1);
} else {
  console.log(`\n✅ Tous les tests (${passed}/${passed}) passent avec succès !`);
}
