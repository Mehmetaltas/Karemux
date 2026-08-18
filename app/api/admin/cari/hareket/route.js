import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "cari_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI) {
    await denemeKaydet(ip, "cari_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "cari_paneli", true);
  return { izinVar: true };
}

const GECERLI_TURLER = ["satis_veresiye", "tahsilat", "tedarik_borcu", "odeme"];

export async function POST(req) {
  try {
    const { sifre, cariId, tur, tutarTl, aciklama, tarih } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!cariId || !GECERLI_TURLER.includes(tur) || !tutarTl || tutarTl <= 0) {
      return Response.json({ error: "Gecerli cariId, tur ve tutar gerekli" }, { status: 400 });
    }

    await sql`
      INSERT INTO cari_hareketleri (cari_id, tur, tutar_tl, aciklama, tarih)
      VALUES (${cariId}, ${tur}, ${tutarTl}, ${aciklama || null}, ${tarih || new Date().toISOString().slice(0, 10)})
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sifre = searchParams.get("sifre");
    const cariId = searchParams.get("cariId");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!cariId) return Response.json({ error: "cariId gerekli" }, { status: 400 });

    const hareketler = await sql`
      SELECT id, tur, tutar_tl, aciklama, tarih
      FROM cari_hareketleri WHERE cari_id = ${cariId}
      ORDER BY tarih DESC, id DESC LIMIT 50
    `;
    return Response.json({ hareketler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
