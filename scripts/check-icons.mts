import fs from 'node:fs';
import path from 'node:path';
import { INGREDIENTS } from '../lib/ingredients';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
let errors = 0;

for (const item of INGREDIENTS) {
  const iconHex = item.icon;
  if (!iconHex) {
    console.error(`[ERROR] Ingredient ${item.name} (${item.id}) has no icon defined.`);
    errors++;
    continue;
  }
  
  const iconPath = path.join(ICONS_DIR, `${iconHex}.svg`);
  if (!fs.existsSync(iconPath)) {
    console.error(`[ERROR] Ingredient ${item.name} (${item.id}) uses icon ${iconHex} but ${iconHex}.svg is missing in public/icons/`);
    errors++;
  }
}

if (errors === 0) {
  console.log('✅ All ingredients have a valid icon in public/icons/');
  process.exit(0);
} else {
  console.error(`❌ ${errors} icon(s) are missing.`);
  process.exit(1);
}
