import { sql } from "@/lib/db";
import { personelAdminMi } from "@/lib/personel";
import { resendIstemcisi } from "@/lib/email";

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const talepler = await sql`
      SELECT id, rol, kullanici_id, ad, eposta, konu, mesaj, durum, oncelik, admin_yaniti, olusturulma, guncellenme
      FROM destek_talebi
      ORDER BY (durum = 'acik') DESC, olusturulma DESC
      LIMIT 100
    `;
    const acikSayisi = talepler.filter((t) => t.durum === "acik").length;
    // SLA hedefi: acik talebe 24 saat icinde yanit
    const SLA_MS = 24 * 3600 * 1000;
    for (const t of talepler) {
      t.beklemeSaat = Math.floor((Date.now() - new Date(t.olusturulma).getTime()) / 3600000);
      t.slaAsildi = t.durum === "acik" && !t.admin_yaniti && Date.now() - new Date(t.olusturulma).getTime() > SLA_MS;
    }
    const slaAsilan = talepler.filter((t) => t.slaAsildi).length;

    // Destek sistemi 7 Eylul'de kuruldu - "0 talep" cikan sayilar TAHMIN
    // gerektirmez, sadece BAGLAM gerekir (sistem kac gundur acik).
    const kurulusTarihi = new Date("2026-09-07");
    const gecenGun = Math.max(0, Math.floor((Date.now() - kurulusTarihi.getTime()) / 86400000));

    return Response.json({ talepler, acikSayisi, slaAsilan, sistemGecenGun: gecenGun });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { sifre, id, adminYaniti, durum } = body;
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    if (!id) return Response.json({ error: "id gerekli" }, { status: 400 });

    // Yanit yazildiysa talep sahibine e-posta ile de ilet
    if (adminYaniti && adminYaniti.trim()) {
      try {
        const t = await sql`SELECT eposta, ad, konu FROM destek_talebi WHERE id = ${id}`;
        if (t[0]?.eposta && process.env.RESEND_API_KEY) {
          await resendIstemcisi().emails.send({
            from: "Karemux <bildirim@karemux.com>", to: t[0].eposta,
            subject: `Karemux destek yanıtı (#${id})`,
            text: `Merhaba${t[0].ad ? " " + t[0].ad : ""},\n\n"${(t[0].konu || "").slice(0, 100)}" konulu talebine yanıtımız:\n\n${adminYaniti.trim()}\n\nKaremux Ekibi`,
          });
        }
      } catch (e) { console.error("Destek yanit e-postasi gonderilemedi:", e.message); }
    }

    await sql`
      UPDATE destek_talebi
      SET admin_yaniti = COALESCE(${adminYaniti || null}, admin_yaniti),
          durum = COALESCE(${durum || null}, durum),
          guncellenme = now()
      WHERE id = ${id}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
