import { sql } from "@/lib/db";
import { sifreHashle } from "@/lib/auth";
import { personelAdminMi } from "@/lib/personel";

// GECICI - otomasyon test ogretmen hesabini olusturur/gunceller. Is bitince KALDIRILACAK.
export async function POST(req) {
  try {
    const { sifre } = await req.json();
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const hash = await sifreHashle(process.env.OGRETMEN_TEST_SIFRE || "gecersiz");
    const sonuc = await sql`
      INSERT INTO ogretmenler (ad, brans, eposta, sifre_hash, aktif)
      VALUES ('Otomasyon Test Hesabi', 'Matematik', ${process.env.OGRETMEN_TEST_EPOSTA}, ${hash}, true)
      ON CONFLICT (eposta) DO UPDATE SET sifre_hash = ${hash}, aktif = true
      RETURNING id, eposta, aktif
    `;
    return Response.json({ ok: true, hesap: sonuc[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
