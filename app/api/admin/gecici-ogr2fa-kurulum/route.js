import { sql } from "@/lib/db";
import { sifreHashle } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const hash = await sifreHashle("TestSifre123x");
  const sonuc = await sql`
    INSERT INTO ogretmenler (ad, brans, eposta, sifre_hash, aktif)
    VALUES ('Audit 2FA Ogretmen', 'Matematik', 'audit-2fa-ogretmen@karemux-test.com', ${hash}, true)
    RETURNING id
  `;
  return Response.json({ id: sonuc[0].id });
}
