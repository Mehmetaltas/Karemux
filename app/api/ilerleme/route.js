import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Faz E kilitleme (19 Ekim): ilerleme satirlarini artik SADECE sunucu yazar
// (sinav-oturumu/gonder). Istemcinin bildirdigi dogru/toplam sayisi guvenilmez
// oldugu icin bu uc kapatildi; eski sekmeler hatayi sessizce yutar.
export async function POST() {
  return Response.json({ error: "Ilerleme sunucuda kaydedilir; bu uc nokta kapatildi" }, { status: 410 });
}

export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ gecmis: [], zayifDersler: [] });

    const satirlar = await sql`
      SELECT ders, konu, SUM(dogru_sayisi) AS dogru, SUM(toplam_soru) AS toplam
      FROM ilerleme
      WHERE kullanici_id = ${kullaniciId}
      GROUP BY ders, konu
      ORDER BY (SUM(dogru_sayisi)::float / NULLIF(SUM(toplam_soru), 0)) ASC
    `;

    const zayifDersler = [...new Set(
      satirlar.filter((s) => s.dogru / s.toplam < 0.6).map((s) => s.ders)
    )];

    return Response.json({ gecmis: satirlar, zayifDersler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
