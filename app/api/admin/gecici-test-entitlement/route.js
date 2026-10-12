import { sql } from "@/lib/db";
import { hasEntitlement } from "@/lib/paket";

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const gercek = process.env.ULUSAL_DENEME_YONETICI_SIFRESI;
  if (sifre !== gercek) {
    return Response.json({
      error: "yetkisiz",
      teshis: {
        girilenUzunluk: (sifre || "").length,
        gercekUzunluk: (gercek || "").length,
        trimliEslesiyorMu: (sifre || "").trim() === (gercek || "").trim(),
      },
    }, { status: 401 });
  }

  // Haklari olan (yillik_* veya deneme_kulubu_*) aktif bir abone bul
  const hakli = await sql`
    SELECT a.kullanici_id, p.anahtar FROM abonelikler a
    JOIN paketler p ON p.id = a.paket_id
    WHERE a.durum = 'aktif' AND (p.haklar ->> 'exam_access') = 'true'
    LIMIT 1
  `;
  // Hakki olmayan (haklar bos ya da hic abonelik yok) aktif bir abone bul
  const haksiz = await sql`
    SELECT a.kullanici_id, p.anahtar FROM abonelikler a
    JOIN paketler p ON p.id = a.paket_id
    WHERE a.durum = 'aktif' AND (p.haklar ->> 'exam_access') IS DISTINCT FROM 'true'
    LIMIT 1
  `;

  const sonuc = {
    hakliOrnek: hakli[0] || null,
    hakliSonuc: hakli[0] ? await hasEntitlement(hakli[0].kullanici_id, "exam_access") : null,
    haksizOrnek: haksiz[0] || null,
    haksizSonuc: haksiz[0] ? await hasEntitlement(haksiz[0].kullanici_id, "exam_access") : null,
  };
  return Response.json(sonuc);
}
