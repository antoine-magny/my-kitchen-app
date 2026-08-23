import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
    process.exit(1);
  }
  
  if (users.users.length === 0) {
    console.log("No users found.");
  } else {
    users.users.forEach(u => {
      console.log(`User ID: ${u.id}, Email: ${u.email}`);
    });
  }
}

main();
