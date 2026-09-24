import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const anonHesaplar = await sql`SELECT id, eposta FROM kullanicilar WHERE eposta LIKE '%@anon.karemux.com'`;
  const testEpostaHesaplar = await sql`SELECT id, eposta FROM kullanicilar WHERE eposta LIKE '%@karemux-test.com' OR eposta LIKE 'audit-%'`;
  const anonIdler = anonHesaplar.map(h => h.id);
  const testIdler = testEpostaHesaplar.map(h => h.id);
  const tumIdler = [...anonIdler, ...testIdler];

  async function iliskiliVeriSay(idler) {
    if (idler.length === 0) return {};
    const sonuc = {};
    const tablolar = [
      "ulusal_deneme_sonuclari", "ucretli_deneme_sonuclari", "sinav_sonuclari",
      "hata_kitapcigi", "ilerleme", "seviye_tespit_kademe", "seviye_tespit_sonuc",
      "gunluk_kullanim", "gunluk_gorevler", "konu_hakimiyet", "tek_konu_oturumu",
      "veli_ogrenci", "canli_ders_katilimcilari", "geri_bildirimler", "randevular",
    ];
    for (const t of tablolar) {
      try {
        const kolon = t === "veli_ogrenci" ? "ogrenci_id" : "kullanici_id";
        const r = await sql.query(`SELECT COUNT(*)::int as c FROM ${t} WHERE ${kolon} = ANY($1)`, [idler]);
        if (r[0].c > 0) sonuc[t] = r[0].c;
      } catch (e) { /* tablo/kolon yoksa atla */ }
    }
    return sonuc;
  }

  const iliskiliVeri = await iliskiliVeriSay(tumIdler);

  return Response.json({
    anonHesapSayisi: anonIdler.length,
    testEpostaHesapSayisi: testIdler.length,
    toplamSilinecek: tumIdler.length,
    iliskiliVeriBulunanTablolar: iliskiliVeri,
  });
}
