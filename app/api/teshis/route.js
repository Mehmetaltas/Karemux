import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { getUserPackage } from "@/lib/paket";
import { UCRETSIZ_GUNLUK_LIMIT, PREMIUM_ADIL_KULLANIM_LIMIT } from "@/lib/ratelimit";

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

    const paket = await getUserPackage(kullaniciId);
    const premium = !!paket;
    kontroller.push({ ad: "Abonelik", durum: "ok", detay: premium ? `Premium aktif (${paket})` : "Ucretsiz plan" });

    // ONEMLI: premium kullanicilar da artik gizli bir adil kullanim tavanina
    // (70/gun) tabi - bu kontrol eskiden SADECE ucretsiz kullanicilar icin
    // yapiliyordu, premium kullanicilar tavana takilsa teshis bunu goremiyordu.
    const kullanim = await sql`SELECT ai_istek_sayisi FROM gunluk_kullanim WHERE kullanici_id = ${kullaniciId} AND tarih = CURRENT_DATE`;
    const kullanilan = kullanim[0]?.ai_istek_sayisi || 0;
    const limit = premium ? PREMIUM_ADIL_KULLANIM_LIMIT : UCRETSIZ_GUNLUK_LIMIT;
    kontroller.push({ ad: "Gunluk AI Kullanim Hakki", durum: kullanilan < limit ? "ok" : "sorun", detay: `Bugun ${kullanilan}/${limit} istek kullanildi` });

    kontroller.push({ ad: "Veritabani Baglantisi", durum: "ok", detay: "Sorgular basariyla calisiyor (bu rapor zaten DB'den geldi)" });

    const genelDurum = kontroller.some((c) => c.durum === "sorun") ? "sorun" : kontroller.some((c) => c.durum === "uyari") ? "uyari" : "ok";
    return Response.json({ kontroller, genelDurum });
  } catch (e) {
    console.error(e);
    return Response.json({ kontroller: [{ ad: "Genel", durum: "sorun", detay: "Teshis calisirken hata olustu: " + e.message }], genelDurum: "sorun" }, { status: 200 });
  }
}
