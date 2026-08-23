import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

function metaString(metadata: User["user_metadata"] | undefined, key: string): string {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function firstWord(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? "";
}

export function firstNameFromUser(user: User | null | undefined): string {
  const given = metaString(user?.user_metadata, "given_name");
  if (given) return given;

  const full =
    metaString(user?.user_metadata, "full_name") || metaString(user?.user_metadata, "name");
  return firstWord(full);
}

export function initialFromName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export async function resolveUserFirstName(
  supabase: SupabaseClient<Database>,
  user: User | null | undefined,
): Promise<string> {
  const fromMeta = firstNameFromUser(user);
  if (fromMeta) return fromMeta;
  if (!user) return "";

  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return firstWord(data?.full_name?.trim() ?? "");
}
