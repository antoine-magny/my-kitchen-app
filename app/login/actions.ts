"use server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getUserProviders(email: string): Promise<string[] | null> {
  const admin = createAdminClient();
  const { data: { users }, error } = await admin.auth.admin.listUsers();
  if (error) return null;
  const user = users.find(u => u.email === email);
  if (!user) return null;
  return user.app_metadata?.providers || null;
}
