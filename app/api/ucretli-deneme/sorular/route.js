import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

function seedliRastgele(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seedUret(metin) {
  let h = 0;
  for (let i = 0; i < metin.length; i++) {
    h = (Math.imul(31, h) + metin.charCodeAt(i)) | 0;
  }
  return h;
}

function seedliKaristir(dizi, rastgele) {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

export function abKitapciğiOlustur(sorular, seedMetin) {
  const rastgele = seedliRastgele(seedUret(seedMetin));
  const soruSirasiKarisik = seedliKaristir(sorular, rastgele);
  return soruSirasiKarisik.map((s) => {
    if (!s.secenekler || s.dogruIndex == null) return s;
    const dogruMetin = s.secenekler[s.dogruIndex];
    const harfsizSecenekler = s.secenekler.map((sec) => sec.replace(/^[A-D]\)\s*/, ""));
    const dogruMetinHarfsiz = dogruMetin.replace(/^[A-D]\)\s*/, "");
    const indeksler = seedliKaristir([0, 1, 2, 3].slice(0, harfsizSecenekler.length), rastgele);
    const yeniSecenekler = indeksler.map((eskiIdx, yeniIdx) => `${String.fromCharCode(65 + yeniIdx)}) ${harfsizSecenekler[eskiIdx]}`);
    const yeniDogruIndex = indeksler.findIndex((eskiIdx) => harfsizSecenekler[eskiIdx] === dogruMetinHarfsiz);
    return { ...s, secenekler: yeniSecenekler, dogruIndex: yeniDogruIndex };
  });
}

export async function GET(req) {
  try {
    const u = new URL(req.url);
    const denemeId = u.searchParams.get("denemeId");
    const cihazId = u.searchParams.get("cihazId");
    if (!denemeId) return Response.json({ error: "denemeId gerekli" }, { status: 400 });

    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const kullanici = await sql`SELECT kurum_id FROM kullanicilar WHERE id = ${kullaniciId}`;
    const kurumId = kullanici[0]?.kurum_id;
    if (!kurumId) return Response.json({ error: "Kurum baglantin yok" }, { status: 403 });

    const satinAlma = await sql`
      SELECT 1 FROM kurum_deneme_satin_alma WHERE kurum_id = ${kurumId} AND deneme_id = ${denemeId} AND odendi = true
    `;
    if (satinAlma.length === 0) return Response.json({ error: "Kurumun bu denemeye erisimi yok" }, { status: 403 });

    const zatenCozmus = await sql`SELECT id FROM ucretli_deneme_sonuclari WHERE deneme_id = ${denemeId} AND kullanici_id = ${kullaniciId}`;
    if (zatenCozmus.length > 0) return Response.json({ error: "Bu denemeyi zaten cozdun" }, { status: 400 });

    const deneme = await sql`SELECT ad, ders, sinif, sorular FROM ucretli_denemeler WHERE id = ${denemeId} AND aktif = true`;
    if (deneme.length === 0) return Response.json({ error: "Deneme bulunamadi" }, { status: 404 });

    const kitapcikSorulari = abKitapciğiOlustur(deneme[0].sorular, `${kullaniciId}-${denemeId}`);
    const soyulmusSorular = kitapcikSorulari.map((s) => ({ soru: s.soru, secenekler: s.secenekler }));

    return Response.json({
      deneme: { id: Number(denemeId), ad: deneme[0].ad, ders: deneme[0].ders, sinif: deneme[0].sinif },
      sorular: soyulmusSorular,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Getirilemedi" }, { status: 500 });
  }
}
