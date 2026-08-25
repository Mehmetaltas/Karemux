import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { resendIstemcisi } from "@/lib/email";

// Karemux Kariyer - sessiz, her zaman acik basvuru kanali (resmi ilan DEGIL).
// basvuruTuru: 'tam_zamanli' | 'danismanlik'
export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "kariyer_basvuru", 3, 60);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla basvuru denemesi. 1 saat sonra tekrar dene." }, { status: 429 });

    const { ad, eposta, telefon, basvuruTuru, departman, deneyimYili, egitimSeviyesi, egitimAlani, portfolyoUrl, ozgecmisMetni, adliSicilBeyani, bilgiDogruluguBeyani } = await req.json();

    if (!ad?.trim() || !eposta?.trim() || !departman?.trim()) {
      return Response.json({ error: "Ad, eposta ve departman gerekli" }, { status: 400 });
    }
    if (!["tam_zamanli", "danismanlik"].includes(basvuruTuru)) {
      return Response.json({ error: "Gecerli bir basvuru turu secilmeli" }, { status: 400 });
    }
    if (!adliSicilBeyani || !bilgiDogruluguBeyani) {
      return Response.json({ error: "Beyanlar onaylanmadan basvuru kabul edilmiyor" }, { status: 400 });
    }

    await sql`
      INSERT INTO kariyer_basvurulari (ad, eposta, telefon, basvuru_turu, departman, deneyim_yili, egitim_seviyesi, egitim_alani, portfolyo_url, ozgecmis_metni, adli_sicil_beyani, bilgi_dogrulugu_beyani)
      VALUES (${ad.trim()}, ${eposta.trim()}, ${telefon || null}, ${basvuruTuru}, ${departman.trim()}, ${deneyimYili || null}, ${egitimSeviyesi || null}, ${egitimAlani || null}, ${portfolyoUrl || null}, ${ozgecmisMetni || null}, ${true}, ${true})
    `;

    try {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: "info@karemux.com",
        subject: `Yeni Kariyer Başvurusu: ${ad.trim()} (${departman.trim()})`,
        html: `<p><b>${ad.trim()}</b> (${eposta.trim()}) — ${basvuruTuru === "danismanlik" ? "Danışmanlık" : "Tam Zamanlı"} — ${departman.trim()}</p>
<p>Deneyim: ${deneyimYili ?? "?"} yıl · Eğitim: ${egitimSeviyesi || "?"}${egitimAlani ? ` (${egitimAlani})` : ""}</p>
${portfolyoUrl ? `<p>Portfolyo: ${portfolyoUrl}</p>` : ""}
<p>Admin panelinden incele: https://karemux-nu.vercel.app/admin</p>`,
      });
    } catch (e) { console.error("Kariyer bildirim epostasi gonderilemedi:", e); }

    await denemeKaydet(ip, "kariyer_basvuru", true);
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Başvuru gönderilemedi: " + e.message }, { status: 500 });
  }
}
