import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// GECICI (1 Eylul) - DATABASE_URL yerel CLI'dan artik "Sensitive" oldugu
// icin psql ile direkt erisim yok. Bu uc nokta, Vercel'in kendi calisma
// zamanindaki (gercek) baglantiyi kullanarak SQL calistirir. IS BITINCE
// KALDIRILACAK - kalici birakmak guvenlik riski olur (rastgele SQL calistirma).
export async function POST(req) {
  try {
    const { sifre } = await req.json();
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }

    await sql`ALTER TABLE soru_bankasi ADD COLUMN IF NOT EXISTS beceri TEXT`;
    await sql`ALTER TABLE soru_bankasi ADD COLUMN IF NOT EXISTS tahmini_sure_saniye INTEGER`;
    await sql`ALTER TABLE soru_bankasi ADD COLUMN IF NOT EXISTS yaygin_hata TEXT`;
    await sql`ALTER TABLE soru_bankasi ADD COLUMN IF NOT EXISTS cozum_teknigi TEXT`;

    const kontrol = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'soru_bankasi' AND column_name IN ('beceri','tahmini_sure_saniye','yaygin_hata','cozum_teknigi')
    `;
    return Response.json({ ok: true, eklenenSutunlar: kontrol.map((r) => r.column_name) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
