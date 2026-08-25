import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "kasa_paneli", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "kasa_paneli", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "kasa_paneli", true);
  return { izinVar: true };
}

const GECERLI_TURLER = ["giris", "cikis"];

export async function POST(req) {
  try {
    const { sifre, hesapId, tur, tutarTl, aciklama, tarih } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!hesapId || !GECERLI_TURLER.includes(tur) || !tutarTl || tutarTl <= 0) {
      return Response.json({ error: "Gecerli hesapId, tur ve tutar gerekli" }, { status: 400 });
    }

    await sql`
      INSERT INTO kasa_hareketleri (hesap_id, tur, tutar_tl, aciklama, tarih)
      VALUES (${hesapId}, ${tur}, ${tutarTl}, ${aciklama || null}, ${tarih || new Date().toISOString().slice(0, 10)})
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
    const hesapId = searchParams.get("hesapId");
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!hesapId) return Response.json({ error: "hesapId gerekli" }, { status: 400 });

    const hareketler = await sql`
      SELECT id, tur, tutar_tl, aciklama, tarih
      FROM kasa_hareketleri WHERE hesap_id = ${hesapId}
      ORDER BY tarih DESC, id DESC LIMIT 50
    `;
    return Response.json({ hareketler });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
