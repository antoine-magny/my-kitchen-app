import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/keep-alive
 *
 * Ping léger de la base Supabase pour éviter la mise en veille (plan free).
 * Sécurisé via CRON_SECRET — Vercel envoie `Authorization: Bearer <secret>`.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("aisles").select("id").limit(1);

    if (error) {
      return Response.json(
        { ok: false, error: error.message.slice(0, 200) },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    const message =
      err instanceof Error ? err.message.slice(0, 200) : "Keep-alive failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
