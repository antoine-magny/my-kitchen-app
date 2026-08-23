import fs from "fs";
import path from "path";
import { INGREDIENTS } from "../lib/ingredients";
import { OPENMOJI_DICTIONARY } from "../lib/openmoji-dictionary";

const iconsDir = path.join(process.cwd(), "public", "icons");

let hasErrors = false;

for (const item of INGREDIENTS) {
  if (!item.icon) {
    console.error(`❌ L'ingrédient "${item.name}" n'a pas de champ 'icon'.`);
    hasErrors = true;
    continue;
  }

  // 1. Vérification dans le dictionnaire
  if (!(item.icon in OPENMOJI_DICTIONARY)) {
    console.error(`❌ L'ingrédient "${item.name}" utilise l'icône inconnue "${item.icon}".`);
    hasErrors = true;
  }

  // 2. Vérification physique du SVG
  const svgPath = path.join(iconsDir, `${item.icon}.svg`);
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ Le fichier SVG pour "${item.icon}" (${item.name}) est introuvable dans public/icons/.`);
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
