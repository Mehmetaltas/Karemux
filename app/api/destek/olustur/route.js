import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { ogretmenCoz } from "@/lib/ogretmen";

// Destek/Ticket Sistemi v1 (7 Eylul) - ogrenci/veli/kurum (kullanicilar
// tablosu) veya ogretmen oturumundan kimlik cozmeye calisir, bulamazsa
// anonim (sadece ad/eposta) kabul eder. Herkes talep acabilir.
export async function POST(req) {
  try {
    const { rol, ad, eposta, konu, mesaj, cihazId } = await req.json();
    if (!konu?.trim() || !mesaj?.trim()) {
      return Response.json({ error: "Konu ve mesaj gerekli" }, { status: 400 });
    }
    const rolTemiz = ["ogrenci", "veli", "ogretmen", "kurum"].includes(rol) ? rol : "diger";

    let kullaniciId = null;
    try {
      kullaniciId = await kullaniciIdCoz(req, cihazId);
      if (!kullaniciId) {
        const ogretmen = await ogretmenCoz(req);
        kullaniciId = ogretmen?.id || null;
      }
    } catch (e) { /* kimlik cozulemezse anonim devam */ }

    const sonuc = await sql`
      INSERT INTO destek_talebi (rol, kullanici_id, ad, eposta, konu, mesaj)
      VALUES (${rolTemiz}, ${kullaniciId}, ${ad || null}, ${eposta || null}, ${konu.trim()}, ${mesaj.trim()})
      RETURNING id
    `;

    return Response.json({ ok: true, id: sonuc[0].id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Talep gonderilemedi" }, { status: 500 });
  }
}
