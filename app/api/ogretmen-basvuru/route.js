import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { resendIstemcisi } from "@/lib/email";

// Herkese acik ogretmen basvuru formu - kimlik dogrulama gerektirmez,
// ama spam/kotuye kullanima karsi IP bazli deneme siniri var.
// GUNCELLEME (25 Agustos): tam CV bilgileri + YASAL beyanlar zorunlu -
// adli sicil (cocuklarla calisan platform icin guvenlik onlemi) ve
// bilgi dogrulugu (yanlis beyanin sorumlulugu basvurana ait) onaylanmadan
// basvuru kabul edilmiyor.
export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_basvuru", 3, 60);
    if (!kontrol.izinVar) {
      return Response.json({ error: "Cok fazla basvuru denemesi. 1 saat sonra tekrar dene." }, { status: 429 });
    }

    const {
      ad, eposta, telefon, brans, kategori, istenenKademe, deneyimYili, ozgecmisMetni,
      egitimSeviyesi, egitimAlani, sertifikalar, sinavHazirlikDeneyimi,
      adliSicilBeyani, bilgiDogruluguBeyani, cvDosyaUrl,
    } = await req.json();

    if (!ad?.trim() || !eposta?.trim() || !brans?.trim() || !kategori?.trim()) {
      return Response.json({ error: "Ad, eposta, brans ve kategori gerekli" }, { status: 400 });
    }
    if (!["A", "B", "C"].includes(istenenKademe)) {
      return Response.json({ error: "Gecerli bir kademe secilmeli (A/B/C)" }, { status: 400 });
    }
    if (!egitimSeviyesi?.trim()) {
      return Response.json({ error: "Egitim seviyesi gerekli" }, { status: 400 });
    }
    if (!adliSicilBeyani) {
      return Response.json({ error: "Adli sicil kaydi beyani onaylanmadan basvuru kabul edilmiyor" }, { status: 400 });
    }
    if (!bilgiDogruluguBeyani) {
      return Response.json({ error: "Bilgi dogrulugu beyani onaylanmadan basvuru kabul edilmiyor" }, { status: 400 });
    }

    await sql`
      INSERT INTO ogretmen_basvurulari (
        ad, eposta, telefon, brans, kategori, istenen_kademe, deneyim_yili, ozgecmis_metni,
        egitim_seviyesi, egitim_alani, sertifikalar, sinav_hazirlik_deneyimi,
        adli_sicil_beyani, bilgi_dogrulugu_beyani, cv_dosya_url
      )
      VALUES (
        ${ad.trim()}, ${eposta.trim()}, ${telefon || null}, ${brans.trim()}, ${kategori.trim()}, ${istenenKademe}, ${deneyimYili || null}, ${ozgecmisMetni || null},
        ${egitimSeviyesi.trim()}, ${egitimAlani || null}, ${sertifikalar || null}, ${!!sinavHazirlikDeneyimi},
        ${true}, ${true}, ${cvDosyaUrl || null}
      )
    `;

    await denemeKaydet(ip, "ogretmen_basvuru", true);

    // Info kutusuna bildirim - basarisiz olsa da basvurunun kendisini engellemez.
    try {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: "info@karemux.com",
        subject: `Yeni Ogretmen Basvurusu: ${ad.trim()} (${brans.trim()}, ${istenenKademe} kademe)`,
        html: `<p><b>${ad.trim()}</b> yeni bir ogretmen basvurusu gonderdi.</p>
<p>Eposta: ${eposta.trim()}${telefon ? ` · Telefon: ${telefon}` : ""}</p>
<p>Brans: ${brans.trim()} · Kategori: ${kategori.trim()} · Kademe: ${istenenKademe}</p>
<p>Deneyim: ${deneyimYili ?? "?"} yil · Egitim: ${egitimSeviyesi.trim()}${egitimAlani ? ` (${egitimAlani})` : ""}</p>
<p>Admin panelinden incele: https://karemux-nu.vercel.app/admin</p>`,
      });
    } catch (e) { console.error("Basvuru bildirim epostasi gonderilemedi:", e); }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Basvuru gonderilemedi: " + e.message }, { status: 500 });
  }
}
