import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "planlama_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "planlama_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "planlama_paneli", true);
  return { izinVar: true };
}

export async function GET(req) {
  try {
    const sifre = new URL(req.url).searchParams.get("sifre");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

    const simdi = new Date();
    const yil = simdi.getFullYear();
    const ay = simdi.getMonth() + 1;

    const hedef = await sql`SELECT gelir_hedefi_tl, gider_hedefi_tl, notlar FROM finansal_hedefler WHERE yil = ${yil} AND ay = ${ay}`;

    const gerceklesen = await sql`
      SELECT
        (SELECT COALESCE(SUM(net_gelir_tl),0)::numeric FROM satislar WHERE olusturulma >= date_trunc('month', CURRENT_DATE)) AS gelir,
        (SELECT COALESCE(SUM(tutar_tl),0)::numeric FROM giderler WHERE tarih >= date_trunc('month', CURRENT_DATE)) AS gider
    `;

    // Basit projeksiyon: son 3 TAMAMLANMIS ayin ortalama geliri, artik tekrarlayan
    // giderlerin toplami dusulerek. Bu, "hicbir sey degismezse" senaryosudur.
    const sonUcAyGelir = await sql`
      SELECT date_trunc('month', olusturulma) AS ay, SUM(net_gelir_tl)::numeric AS toplam
      FROM satislar
      WHERE olusturulma >= date_trunc('month', CURRENT_DATE) - interval '3 months' AND olusturulma < date_trunc('month', CURRENT_DATE)
      GROUP BY ay
    `;
    const ortalamaAylikGelir = sonUcAyGelir.length > 0
      ? sonUcAyGelir.reduce((t, r) => t + Number(r.toplam), 0) / sonUcAyGelir.length
      : 0;

    const tekrarlayanGiderler = await sql`SELECT COALESCE(SUM(tutar_tl),0)::numeric AS toplam FROM giderler WHERE tekrarlayan = true`;
    const tekrarlayanToplam = Number(tekrarlayanGiderler[0].toplam);

    const projeksiyon = Math.round((ortalamaAylikGelir - tekrarlayanToplam) * 100) / 100;

    return Response.json({
      yil, ay,
      hedef: hedef[0] || null,
      gerceklesen: { gelir: Number(gerceklesen[0].gelir), gider: Number(gerceklesen[0].gider) },
      projeksiyon: {
        ortalamaAylikGelir: Math.round(ortalamaAylikGelir * 100) / 100,
        tekrarlayanAylikGider: tekrarlayanToplam,
        tahminiAylikKar: projeksiyon,
        veriliAySayisi: sonUcAyGelir.length,
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sifre, yil, ay, gelirHedefiTl, giderHedefiTl, notlar } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!yil || !ay) return Response.json({ error: "Yil ve ay gerekli" }, { status: 400 });

    await sql`
      INSERT INTO finansal_hedefler (yil, ay, gelir_hedefi_tl, gider_hedefi_tl, notlar)
      VALUES (${yil}, ${ay}, ${gelirHedefiTl || 0}, ${giderHedefiTl || 0}, ${notlar || null})
      ON CONFLICT (yil, ay) DO UPDATE SET gelir_hedefi_tl = ${gelirHedefiTl || 0}, gider_hedefi_tl = ${giderHedefiTl || 0}, notlar = ${notlar || null}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
