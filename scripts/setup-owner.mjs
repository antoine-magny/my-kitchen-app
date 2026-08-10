/**
 * Crée (ou retrouve) l'unique utilisateur propriétaire de l'app et enregistre
 * son identifiant dans .env.local. Rejouable sans risque.
 *
 * Usage : node scripts/setup-owner.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ENV_FILE = ".env.local";
const OWNER_EMAIL = "owner@my-kitchen.local";
const OWNER_NAME = "Antoine";

process.loadEnvFile(ENV_FILE);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error(
    `Renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY dans ${ENV_FILE}.\n` +
      "La clé secrète se trouve dans Project Settings > API Keys > secret key.",
  );
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing, error: listError } = await admin.auth.admin.listUsers();
if (listError) throw listError;

let owner = existing.users.find((user) => user.email === OWNER_EMAIL);

if (owner) {
  console.log(`Propriétaire déjà existant (${OWNER_EMAIL}), réutilisé.`);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: OWNER_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
  });
  if (error) throw error;
  owner = data.user;
  console.log(`Propriétaire créé (${OWNER_EMAIL}).`);
}

// Le trigger on_auth_user_created s'en charge normalement ; ce filet évite un
// échec de clé étrangère si l'utilisateur a été créé avant son installation.
const { error: profileError } = await admin
  .from("profiles")
  .upsert({ id: owner.id, full_name: OWNER_NAME }, { onConflict: "id" });
if (profileError) throw profileError;

const env = readFileSync(ENV_FILE, "utf8");
const updated = env.includes("KITCHEN_OWNER_ID=")
  ? env.replace(/^KITCHEN_OWNER_ID=.*$/m, `KITCHEN_OWNER_ID=${owner.id}`)
  : `${env.trimEnd()}\nKITCHEN_OWNER_ID=${owner.id}\n`;
writeFileSync(ENV_FILE, updated);

console.log(`KITCHEN_OWNER_ID=${owner.id} écrit dans ${ENV_FILE}.`);
console.log("Redémarrez `npm run dev` pour que la variable soit prise en compte.");
