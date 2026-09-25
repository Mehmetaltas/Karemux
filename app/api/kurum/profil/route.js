import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// Kurumun kendi bilgilerini (vergi bilgileri dahil) goruntulemesi/guncellemesi.
// Vergi bilgileri BIR KERE girilir, her satin almada tekrar sorulmaz.
export async function GET(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });
    const kurum = await sql`SELECT id, ad, kurum_kodu, vergi_no, vergi_dairesi, yetkili_unvan, logo_url FROM kurumlar WHERE id = ${yonetici.kurumId}`;
    return Response.json({ kurum: kurum[0] || null });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kurum bilgisi alinamadi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const { vergiNo, vergiDairesi, yetkiliUnvan, logoUrl } = await req.json();
    const vergiNoTemiz = (vergiNo || "").replace(/\D/g, "");
    if (vergiNoTemiz.length !== 10) {
      return Response.json({ error: "Gecerli bir vergi numarasi girilmeli (10 hane)" }, { status: 400 });
    }
    if (!vergiDairesi || !vergiDairesi.trim()) {
      return Response.json({ error: "Vergi dairesi gerekli" }, { status: 400 });
    }

    // 25 Eylul: logo_url artik SADECE /api/kurum/logo-yukle'nin (Vercel Blob)
    // dondurdugu adresi kabul eder - serbest dis URL riski (SSRF/istismar)
    // kapatildi. Bos deger her zaman gecerli (logoyu kaldirmak icin).
    const logoTemiz = logoUrl?.trim() || null;
    if (logoTemiz && !logoTemiz.startsWith("https://") ) {
      return Response.json({ error: "Gecersiz logo adresi" }, { status: 400 });
    }
    if (logoTemiz && !/\.vercel-storage\.com\//.test(logoTemiz)) {
      return Response.json({ error: "Logo, sadece /api/kurum/logo-yukle uzerinden yuklenebilir" }, { status: 400 });
    }

    await sql`
      UPDATE kurumlar SET vergi_no = ${vergiNoTemiz}, vergi_dairesi = ${vergiDairesi.trim()}, yetkili_unvan = ${yetkiliUnvan || null}, logo_url = ${logoTemiz}
      WHERE id = ${yonetici.kurumId}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Guncellenemedi" }, { status: 500 });
  }
}
