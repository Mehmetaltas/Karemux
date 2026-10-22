import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";
import { ogretmenCoz } from "@/lib/ogretmen";
import { resendIstemcisi } from "@/lib/email";
import { yoneticiUyar } from "@/lib/uyari";

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

    // 22 Ekim (Madde 43): SLA - yoneticiye aninda Telegram uyarisi, talep sahibine alindi e-postasi (24 saat icinde yanit hedefi).
    const talepNo = sonuc[0].id;
    yoneticiUyar(`destek-${talepNo}`, `🎫 KAREMUX yeni destek talebi #${talepNo} (${rolTemiz}): ${konu.trim().slice(0, 80)}`, 1).catch(() => {});
    if (eposta && /^\S+@\S+\.\S+$/.test(eposta) && process.env.RESEND_API_KEY) {
      resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>", to: eposta,
        subject: `Karemux destek talebin alındı (#${talepNo})`,
        text: `Merhaba${ad ? " " + ad : ""},\n\n"${konu.trim().slice(0, 100)}" konulu talebin bize ulaştı. 24 saat içinde yanıtlamayı hedefliyoruz; yanıtımız bu e-posta adresine gelecek.\n\nKaremux Ekibi`,
      }).catch((e) => console.error("Destek onay e-postasi gonderilemedi:", e.message));
    }
    return Response.json({ ok: true, id: talepNo });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Talep gonderilemedi" }, { status: 500 });
  }
}
