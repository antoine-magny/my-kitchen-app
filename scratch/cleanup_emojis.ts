import fs from "fs";
import path from "path";
import { INGREDIENTS, EMOJI_TO_HEX_MAP } from "../lib/ingredients";

const iconsDir = path.join(process.cwd(), "public", "icons");

const usedHex = new Set<string>();
INGREDIENTS.forEach(i => {
  if (i.icon) usedHex.add(i.icon.toUpperCase());
});
Object.values(EMOJI_TO_HEX_MAP).forEach(hex => {
  usedHex.add(hex.toUpperCase());
});
// Add DEFAULT_INGREDIENT_ICON (2753)
usedHex.add("2753");

console.log(`Nombre d'icônes uniques utilisées: ${usedHex.size}`);

// Delete unused svgs
const files = fs.readdirSync(iconsDir);
let deletedCount = 0;
for (const file of files) {
  if (file.endsWith(".svg")) {
    const hex = file.replace(".svg", "").toUpperCase();
    if (!usedHex.has(hex)) {
      fs.unlinkSync(path.join(iconsDir, file));
      deletedCount++;
    }
  }
}

console.log(`Suppression de ${deletedCount} fichiers SVG non utilisés.`);

// Delete snapshots directory
const snapshotsDir = path.join(process.cwd(), "_snapshots");
if (fs.existsSync(snapshotsDir)) {
  fs.rmSync(snapshotsDir, { recursive: true, force: true });
  console.log("Dossier _snapshots supprimé.");
}

// Delete openmoji-dictionary
const dictFile = path.join(process.cwd(), "lib", "openmoji-dictionary.ts");
if (fs.existsSync(dictFile)) {
  fs.unlinkSync(dictFile);
  console.log("Fichier lib/openmoji-dictionary.ts supprimé.");
}

console.log("Nettoyage terminé.");
