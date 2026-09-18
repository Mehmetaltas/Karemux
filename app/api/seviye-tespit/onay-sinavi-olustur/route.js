import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { aiCagir } from "@/lib/ai";
import { KALITE_REFERANSLARI } from "@/lib/kalite-referanslari";

// Belirli bir kademe (zayif unite) icin 3 soruluk bir ONAY sinavi uretir.
// Dogru cevaplar (dogruIndex) SUNUCUDA (yeni seviye_onay_sinavlari tablosunda)
// kalir, istemciye HIC gonderilmez - "Okudum, Devam Et" gibi kendi-kendine-
// bildirim acigini kapatmak icin (18 Eylul, kullanici talebiyle kuruldu).
export async function POST(req) {
  try {
    const { cihazId, kademeId } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giriş yapmalısın" }, { status: 401 });
    if (!kademeId) return Response.json({ error: "kademeId gerekli" }, { status: 400 });

    const satir = await sql`SELECT ders, unite, kaynak_sinif FROM seviye_tespit_kademe WHERE id = ${kademeId} AND kullanici_id = ${kullaniciId}`;
    if (satir.length === 0) return Response.json({ error: "Bulunamadı" }, { status: 404 });
    const { ders, unite, kaynak_sinif } = satir[0];

    const kaliteReferansi = KALITE_REFERANSLARI[ders] || "";
    const p = `Sen bir ilkokul/ortaokul ogretmenisin. "${ders}" dersinin "${unite}" unitesi (${kaynak_sinif}. sinif) icin, ogrencinin bu uniteyi GERCEKTEN ogrenip ogrenmedigini olcen 3 SORULUK bir ONAY sinavi hazirla. ${kaliteReferansi ? `Kalite referansi: ${kaliteReferansi}` : ""} Sorular orta zorlukta olsun, temel kavramlari olcsun. SADECE JSON dizisi dondur, tam 3 eleman:
[{"soru":"...","secenekler":["A) ...","B) ...","C) ...","D) ..."],"dogruIndex":0}]`;

    const cevap = await aiCagir({ prompt: p, maxTokens: 1500, jsonModu: true });
    const temiz = cevap.replace(/```json|```/g, "").trim();
    const sorularHam = JSON.parse(temiz.slice(temiz.indexOf("["), temiz.lastIndexOf("]") + 1));

    const sorular = (Array.isArray(sorularHam) ? sorularHam : []).filter((s) =>
      s && typeof s.soru === "string" && Array.isArray(s.secenekler) && s.secenekler.length >= 2 &&
      Number.isInteger(s.dogruIndex) && s.dogruIndex >= 0 && s.dogruIndex < s.secenekler.length
    );
    if (sorular.length === 0) throw new Error("Sorular uretilemedi, tekrar dene");

    const kayit = await sql`INSERT INTO seviye_onay_sinavlari (kademe_id, sorular) VALUES (${kademeId}, ${JSON.stringify(sorular)}) RETURNING id`;

    // Istemciye dogruIndex'siz gonder - sadece soru+secenekler
    const guvenliSorular = sorular.map((s) => ({ soru: s.soru, secenekler: s.secenekler }));
    return Response.json({ onaySinaviId: kayit[0].id, sorular: guvenliSorular });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
