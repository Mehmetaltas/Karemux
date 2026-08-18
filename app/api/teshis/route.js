import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Otomatik teknik teshis: "Derse giremiyorum" gibi belirsiz bir sikayet
// yerine, kullanicinin GERCEK durumunu adim adim kontrol edip somut bir
// rapor doner. Destek ekibi (ya da kullanicinin kendisi) neyin bozuk
// oldugunu tahmin etmek yerine dogrudan gorur.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cihazId = searchParams.get("cihazId");
    const kontroller = [];

    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    kontroller.push({ ad: "Kimlik/Oturum", durum: kullaniciId ? "ok" : "sorun", detay: kullaniciId ? "Oturum gecerli" : "Giris yapilmamis veya oturum suresi dolmus" });

    if (!kullaniciId) {
      return Response.json({ kontroller, genelDurum: "sorun" });
    }

    const kullanici = await sql`
      SELECT rol, eposta_dogrulandi, veli_onay_verildi, sifre_hash
      FROM kullanicilar WHERE id = ${kullaniciId}
    `;
    if (kullanici.length === 0) {
      kontroller.push({ ad: "Hesap Kaydi", durum: "sorun", detay: "Kullanici veritabaninda bulunamadi" });
      return Response.json({ kontroller, genelDurum: "sorun" });
    }
    const k = kullanici[0];
    const anonimMi = k.sifre_hash === "anon";

    if (!anonimMi) {
      kontroller.push({ ad: "E-posta Dogrulamasi", durum: k.eposta_dogrulandi ? "ok" : "uyari", detay: k.eposta_dogrulandi ? "Dogrulanmis" : "Henuz dogrulanmamis - bazi ozellikler kisitli olabilir" });
    }

    if (k.rol === "ogrenci" && !anonimMi) {
      kontroller.push({ ad: "Veli Onayi", durum: k.veli_onay_verildi ? "ok" : "uyari", detay: k.veli_onay_verildi ? "Onaylanmis" : "Veli onayi bekleniyor" });
    }

    const abonelik = await sql`SELECT durum FROM abonelikler WHERE kullanici_id = ${kullaniciId} AND durum = 'aktif' LIMIT 1`;
    const premium = abonelik.length > 0;
    kontroller.push({ ad: "Abonelik", durum: "ok", detay: premium ? "Premium aktif" : "Ucretsiz plan" });

    if (!premium) {
      const kullanim = await sql`SELECT ai_istek_sayisi FROM gunluk_kullanim WHERE kullanici_id = ${kullaniciId} AND tarih = CURRENT_DATE`;
      const kullanilan = kullanim[0]?.ai_istek_sayisi || 0;
      kontroller.push({ ad: "Gunluk AI Kullanim Hakki", durum: kullanilan < 500 ? "ok" : "sorun", detay: `Bugun ${kullanilan}/500 istek kullanildi` });
    }

    kontroller.push({ ad: "Veritabani Baglantisi", durum: "ok", detay: "Sorgular basariyla calisiyor (bu rapor zaten DB'den geldi)" });

    const genelDurum = kontroller.some((c) => c.durum === "sorun") ? "sorun" : kontroller.some((c) => c.durum === "uyari") ? "uyari" : "ok";
    return Response.json({ kontroller, genelDurum });
  } catch (e) {
    console.error(e);
    return Response.json({ kontroller: [{ ad: "Genel", durum: "sorun", detay: "Teshis calisirken hata olustu: " + e.message }], genelDurum: "sorun" }, { status: 200 });
  }
}
