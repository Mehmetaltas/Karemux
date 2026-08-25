import { sql } from "@/lib/db";

function yetkiliMi(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  return sifre === process.env.ULUSAL_DENEME_YONETICI_SIFRESI;
}

export async function GET(req) {
  if (!yetkiliMi(req)) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  const personelListesi = await sql`SELECT id, ad, eposta, rol, aktif FROM personel ORDER BY ad`;
  const izinler = await sql`
    SELECT i.id, i.personel_id, p.ad AS personel_adi, i.baslangic_tarihi, i.bitis_tarihi, i.tur, i.durum, i.aciklama, i.talep_tarihi
    FROM personel_izin i JOIN personel p ON p.id = i.personel_id
    ORDER BY i.talep_tarihi DESC LIMIT 50
  `;
  const gorevler = await sql`
    SELECT g.id, g.baslik, g.aciklama, g.durum, g.oncelik, g.son_tarih, g.olusturulma, p.ad AS atanan_adi
    FROM personel_gorev g LEFT JOIN personel p ON p.id = g.atanan_personel_id
    ORDER BY g.olusturulma DESC LIMIT 50
  `;
  const bugunMesaide = await sql`
    SELECT m.id, p.ad AS personel_adi, m.giris_zamani
    FROM personel_mesai m JOIN personel p ON p.id = m.personel_id
    WHERE m.cikis_zamani IS NULL
  `;
  return Response.json({ personelListesi, izinler, gorevler, bugunMesaide });
}

export async function POST(req) {
  if (!yetkiliMi(req)) return Response.json({ error: "Yetkisiz" }, { status: 401 });
  try {
    const govde = await req.json();

    if (govde.islem === "izinKarar") {
      const { izinId, karar } = govde;
      if (!["onaylandi", "reddedildi"].includes(karar)) return Response.json({ error: "Gecersiz karar" }, { status: 400 });
      await sql`UPDATE personel_izin SET durum = ${karar}, karar_tarihi = now() WHERE id = ${izinId}`;
      return Response.json({ ok: true });
    }

    if (govde.islem === "gorevAta") {
      const { atananPersonelId, baslik, aciklama, oncelik, sonTarih } = govde;
      if (!baslik?.trim()) return Response.json({ error: "Baslik gerekli" }, { status: 400 });
      await sql`
        INSERT INTO personel_gorev (atanan_personel_id, baslik, aciklama, oncelik, son_tarih)
        VALUES (${atananPersonelId || null}, ${baslik.trim()}, ${aciklama || null}, ${oncelik || "normal"}, ${sonTarih || null})
      `;
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Gecersiz islem" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Islem basarisiz" }, { status: 500 });
  }
}
