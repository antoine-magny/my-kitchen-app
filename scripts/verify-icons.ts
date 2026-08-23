import fs from "fs";
import path from "path";
import { INGREDIENTS, EMOJI_TO_HEX_MAP, DEFAULT_INGREDIENT_ICON } from "../lib/ingredients";

const iconsDir = path.join(process.cwd(), "public", "icons");

let hasErrors = false;

const allUsedHex = new Set<string>();

for (const item of INGREDIENTS) {
  if (!item.icon) {
    console.error(`❌ L'ingrédient "${item.name}" n'a pas de champ 'icon'.`);
    hasErrors = true;
    continue;
  }
  allUsedHex.add(item.icon.toUpperCase());
}

for (const hex of Object.values(EMOJI_TO_HEX_MAP)) {
  allUsedHex.add(hex.toUpperCase());
}
allUsedHex.add(DEFAULT_INGREDIENT_ICON.toUpperCase());

for (const hex of allUsedHex) {
  const svgPath = path.join(iconsDir, `${hex}.svg`);
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ Le fichier SVG pour le hex "${hex}" est introuvable dans public/icons/.`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error("💥 La vérification des icônes a échoué. Corrigez les erreurs ci-dessus.");
  process.exit(1);
} else {
  console.log("✅ Toutes les icônes des ingrédients sont valides et présentes !");
  process.exit(0);
}
