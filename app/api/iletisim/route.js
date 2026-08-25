import { resendIstemcisi } from "@/lib/email";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

// Herkese acik genel iletisim formu - info@karemux.com'a gonderir.
export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "iletisim_formu", 3, 60);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 1 saat sonra tekrar dene." }, { status: 429 });

    const { ad, eposta, konu, mesaj } = await req.json();
    if (!ad?.trim() || !eposta?.trim() || !mesaj?.trim()) {
      return Response.json({ error: "Ad, eposta ve mesaj gerekli" }, { status: 400 });
    }

    await resendIstemcisi().emails.send({
      from: "Karemux <bildirim@karemux.com>",
      to: "info@karemux.com",
      replyTo: eposta.trim(),
      subject: `İletişim Formu: ${konu?.trim() || "Genel"} — ${ad.trim()}`,
      html: `<p><b>${ad.trim()}</b> (${eposta.trim()}) iletişim formu üzerinden yazdı.</p>
${konu ? `<p>Konu: ${konu.trim()}</p>` : ""}
<p>${mesaj.trim().replace(/\n/g, "<br>")}</p>`,
    });

    await denemeKaydet(ip, "iletisim_formu", true);
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Gönderilemedi: " + e.message }, { status: 500 });
  }
}
