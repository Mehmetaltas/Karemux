import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";

// GECICI (1 Eylul) - TC Kimlik/Adres guvenlik taramasi TAMAMLANDI (risk yok
// bulundu), ilgili strateji_onerisi kaydini "onaylandi" yapiyor. Is bitince
// KALDIRILACAK.
export async function POST(req) {
  try {
    const { sifre } = await req.json();
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const sonuc = await sql`
      UPDATE strateji_onerisi
      SET durum = 'onaylandi', karar_notu = 'Guvenlik taramasi yapildi (1 Eylul): tum 45 tabloda TC Kimlik/adres alani YOK, risk bulunmadi. Odeme Iyzico tarafinda tutuluyor.'
      WHERE baslik ILIKE '%TC Kimlik%' OR baslik ILIKE '%Adres%Sifreleme%'
      RETURNING id, baslik, durum
    `;
    return Response.json({ ok: true, guncellenen: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
