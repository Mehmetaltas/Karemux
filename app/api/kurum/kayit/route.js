import { sql } from "@/lib/db";
import { sifreHashle, tokenUret, oturumCookieBaslik, altiHaneliKodUret, veliBaglantiKoduUret } from "@/lib/auth";
import { resendIstemcisi } from "@/lib/email";

// Kurum yoneticisi kaydi (Faz 14'un onkosulu): kurum/olustur'un aksine,
// "herhangi biri" kod uretmiyor - gercek bir hesap (eposta+sifre) olusuyor.
// Ayni `kullanicilar` tablosu kullanilir (tek duzen ilkesi), yeni bir "kurum
// hesaplari" sistemi ACILMADI - sadece rol='kurum_yoneticisi' ve kurum_id ile
// isaretleniyor. Giris icin mevcut /api/auth/login zaten rol-bagimsiz calisiyor,
// degisiklik gerekmedi (dogrulandi).
export async function POST(req) {
  try {
    const { kurumAdi, eposta, sifre, yoneticiAdi } = await req.json();
    const testModu = !!(process.env.HEALTH_CHECK_SECRET && req.headers.get("x-health-check-secret") === process.env.HEALTH_CHECK_SECRET);

    if (!kurumAdi || !kurumAdi.trim()) return Response.json({ error: "Kurum adi gerekli" }, { status: 400 });
    if (!eposta || !sifre || sifre.length < 6) {
      return Response.json({ error: "Gecerli bir e-posta ve en az 6 karakterli sifre gerekli" }, { status: 400 });
    }

    const mevcut = await sql`SELECT id FROM kullanicilar WHERE eposta = ${eposta}`;
    if (mevcut.length > 0) {
      return Response.json({ error: "Bu e-posta zaten kayitli" }, { status: 409 });
    }

    // Kurum kaydi olustur (kurum/olustur ile ayni kod uretme deseni)
    let kod, deneme = 0, kurumId = null;
    while (!kurumId && deneme < 8) {
      kod = veliBaglantiKoduUret();
      try {
        const sonuc = await sql`INSERT INTO kurumlar (ad, kurum_kodu) VALUES (${kurumAdi.trim()}, ${kod}) RETURNING id`;
        kurumId = sonuc[0].id;
      } catch (e) { deneme++; }
    }
    if (!kurumId) return Response.json({ error: "Kurum olusturulamadi, tekrar dene" }, { status: 500 });

    const hash = await sifreHashle(sifre);
    const dogrulamaKodu = altiHaneliKodUret();

    const sonuc = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, dogrulama_kodu, dogrulama_kodu_son_tarih, kurum_id, veli_onay_verildi)
      VALUES (${eposta}, ${hash}, ${yoneticiAdi || eposta.split("@")[0]}, 'kurum_yoneticisi', ${dogrulamaKodu}, now() + interval '30 minutes', ${kurumId}, true)
      RETURNING id, ad
    `;
    const kullanici = sonuc[0];
    const token = tokenUret(kullanici.id);

    if (!testModu) {
      try {
        await resendIstemcisi().emails.send({
          from: "Karemux <bildirim@karemux.com>",
          to: eposta,
          subject: "Karemux Kurum Hesabi - Dogrulama Kodun",
          text: `Merhaba ${kullanici.ad},\n\n"${kurumAdi.trim()}" kurumu icin Karemux hesabin olusturuldu.\nKurum kodun: ${kod}\nDogrulama kodun: ${dogrulamaKodu}\n\nKaremux Ekibi`,
        });
      } catch (e) { console.error("Dogrulama e-postasi gonderilemedi:", e); }
    }

    return new Response(JSON.stringify({ ok: true, ad: kullanici.ad, kurumId, kurumKodu: kod }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(token) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kurum kaydi olusturulamadi" }, { status: 500 });
  }
}
