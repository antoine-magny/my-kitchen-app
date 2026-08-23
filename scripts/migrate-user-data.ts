import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function main() {
  const placeholderId = "00000000-0000-0000-0000-000000000001";
  const targetUserId = process.env.KITCHEN_OWNER_ID;

  if (!targetUserId) {
    console.error("No KITCHEN_OWNER_ID found in env.");
    process.exit(1);
  }

  console.log(`Migrating data from ${placeholderId} to ${targetUserId}...`);

  const tables = ["ingredients", "pantry_items", "recipe_ingredients", "recipes"];

  for (const table of tables) {
    console.log(`Updating table ${table}...`);
    const { data, error } = await supabase
      .from(table)
      .update({ user_id: targetUserId })
      .eq('user_id', placeholderId)
      .select();

    if (error) {
      console.error(`Error updating ${table}:`, error.message);
    } else {
      console.log(`Updated ${data.length} rows in ${table}.`);
    }
  }

  console.log("Migration complete.");
}

main();
