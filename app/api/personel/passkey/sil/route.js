import { sql } from "@/lib/db";
import { personelCoz } from "@/lib/personel";
import { webauthnTablolariHazirla } from "@/lib/webauthn";

// Yalniz kendi passkey'ini siler.
export async function POST(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Giriş gerekli" }, { status: 401 });
  const { id } = await req.json();
  if (!Number.isInteger(id)) return Response.json({ error: "id gerekli" }, { status: 400 });
  await webauthnTablolariHazirla();
  await sql`DELETE FROM personel_passkey WHERE id = ${id} AND personel_id = ${personel.id}`;
  return Response.json({ ok: true });
}
