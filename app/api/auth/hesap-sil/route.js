import { sql } from "@/lib/db";
import { oturumdanKullaniciId, cikisCookieBaslik, sifreDogrula } from "@/lib/auth";

// KVKK madde 11 - silme/yok edilmesini isteme hakki. Ogrenme/davranissal
// veriler TAMAMEN silinir (geri donusu yok). Odeme/satis kaydi varsa, yasal
// muhasebe saklama yukumlulugu nedeniyle o kayitlar SILINMEZ ama kullanicinin
// kimlik bilgileri anonimlestirilir (kullanicilar satiri kalir, kisisel
// alanlar temizlenir).
export async function POST(req) {
  try {
    const kullaniciId = oturumdanKullaniciId(req);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const { sifre } = await req.json();
    if (!sifre) return Response.json({ error: "Onay icin sifreni gir" }, { status: 400 });

    const kullanici = await sql`SELECT sifre_hash, eposta FROM kullanicilar WHERE id = ${kullaniciId}`;
    if (kullanici.length === 0) return Response.json({ error: "Kullanici bulunamadi" }, { status: 404 });

    const dogruMu = await sifreDogrula(sifre, kullanici[0].sifre_hash);
    if (!dogruMu) return Response.json({ error: "Sifre hatali" }, { status: 401 });

    await sql`DELETE FROM hata_kitapcigi WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM ilerleme WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM sinav_sonuclari WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM seviye_tespit_kademe WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM seviye_tespit_sonuc WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM ulusal_deneme_sonuclari WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM gunluk_kullanim WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM gunluk_gorevler WHERE kullanici_id = ${kullaniciId}`;
    await sql`DELETE FROM veli_ogrenci WHERE veli_id = ${kullaniciId} OR ogrenci_id = ${kullaniciId}`;
    await sql`DELETE FROM guvenlik_denemeleri WHERE anahtar = ${kullanici[0].eposta}`;

    const silinenKategoriler = "hata_kitapcigi, ilerleme, sinav_sonuclari, seviye_tespit_kademe, seviye_tespit_sonuc, ulusal_deneme_sonuclari, gunluk_kullanim, gunluk_gorevler, veli_ogrenci";

    const maliKayit = await sql`SELECT 1 FROM odemeler WHERE kullanici_id = ${kullaniciId} LIMIT 1`;
    if (maliKayit.length > 0) {
      await sql`
        UPDATE kullanicilar SET
          eposta = ${`silinmis-${kullaniciId}@karemux-anon.com`},
          ad = 'Silinmis Kullanici',
          sifre_hash = 'silindi',
          telefon = NULL, il = NULL, ilce = NULL, okul = NULL, sinif = NULL,
          veli_eposta = NULL, veli_baglanti_kodu = NULL, veli_onay_token = NULL,
          telegram_chat_id = NULL, telegram_baglanti_kodu = NULL,
          hedef_il = NULL, hedef_ilce = NULL, hedef_okul = NULL, hedef_puan = NULL
        WHERE id = ${kullaniciId}
      `;
      // Imha kaydi - KVKK geregi, ama kisisel veri (eposta/isim) ICERMEDEN, sadece anonim referans (id) ile.
      try {
        await sql`
          INSERT INTO imha_kayitlari (anonim_referans, islem_turu, islem_sonucu, silinen_veri_kategorileri, anonimlestirme_yapildi_mi, tetikleyen_olay)
          VALUES (${String(kullaniciId)}, 'hesap_silme', 'basarili', ${silinenKategoriler + ", kullanici_kimlik_bilgisi (anonimlestirildi)"}, true, 'kullanici_talebi')
        `;
      } catch (e) { console.error("Imha kaydi olusturulamadi:", e.message); }

      return new Response(JSON.stringify({ ok: true, anonimlestirildi: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Set-Cookie": cikisCookieBaslik() },
      });
    }

    await sql`DELETE FROM kullanicilar WHERE id = ${kullaniciId}`;
    try {
      await sql`
        INSERT INTO imha_kayitlari (anonim_referans, islem_turu, islem_sonucu, silinen_veri_kategorileri, anonimlestirme_yapildi_mi, tetikleyen_olay)
        VALUES (${String(kullaniciId)}, 'hesap_silme', 'basarili', ${silinenKategoriler + ", kullanici_hesabi (tamamen silindi)"}, false, 'kullanici_talebi')
      `;
    } catch (e) { console.error("Imha kaydi olusturulamadi:", e.message); }

    return new Response(JSON.stringify({ ok: true, anonimlestirildi: false }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": cikisCookieBaslik() },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Hesap silinemedi: " + e.message }, { status: 500 });
  }
}
