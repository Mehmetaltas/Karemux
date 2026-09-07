import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ogrencinin kendi kurumundaki AYNI SINIFTAKI diger ogrencilerle anonim/rumuzlu
// siralamasi. Isimler tam gosterilmez (gizlilik) - sadece ilk isim + soyisim bas
// harfi (orn. "Ahmet Y."). Sadece bir KURUMA baglanmis ogrenciler icin calisir.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ siralama: [], kendiSiran: null });

    const kullanici = await sql`SELECT kurum_id, sinif, sube FROM kullanicilar WHERE id = ${kullaniciId}`;
    const kurumId = kullanici[0]?.kurum_id;
    const sinif = kullanici[0]?.sinif;
    const sube = kullanici[0]?.sube;
    if (!kurumId || !sinif) return Response.json({ siralama: [], kendiSiran: null, kurumaBagliDegil: true });

    // Ogrencinin subesi varsa AYNI SUBEDEKILERLE, yoksa (7 Eylul oncesi
    // davranis korunuyor) tum sinifla karsilastirir.
    const satirlar = sube
      ? await sql`
          SELECT k.id, k.ad, ROUND(AVG(s.net)::numeric, 2) as ortalama_net, COUNT(s.id)::int as test_sayisi
          FROM kullanicilar k
          JOIN sinav_sonuclari s ON s.kullanici_id = k.id
          WHERE k.kurum_id = ${kurumId} AND k.sinif = ${sinif} AND k.sube = ${sube}
          GROUP BY k.id, k.ad
          HAVING COUNT(s.id) >= 2
          ORDER BY ortalama_net DESC
          LIMIT 50
        `
      : await sql`
          SELECT k.id, k.ad, ROUND(AVG(s.net)::numeric, 2) as ortalama_net, COUNT(s.id)::int as test_sayisi
          FROM kullanicilar k
          JOIN sinav_sonuclari s ON s.kullanici_id = k.id
          WHERE k.kurum_id = ${kurumId} AND k.sinif = ${sinif}
          GROUP BY k.id, k.ad
          HAVING COUNT(s.id) >= 2
          ORDER BY ortalama_net DESC
          LIMIT 50
        `;

    const anonimlestir = (adSoyad) => {
      const parcalar = (adSoyad || "").trim().split(/\s+/);
      if (parcalar.length === 1) return parcalar[0];
      return `${parcalar[0]} ${parcalar[parcalar.length - 1][0]}.`;
    };

    const siralama = satirlar.map((s, i) => ({
      sira: i + 1,
      isim: anonimlestir(s.ad),
      ortalamaNet: Number(s.ortalama_net),
      testSayisi: s.test_sayisi,
      benMi: s.id === kullaniciId,
    }));

    const kendiSiran = siralama.find((s) => s.benMi)?.sira || null;

    return Response.json({ siralama, kendiSiran, sube: sube || null });
  } catch (e) {
    console.error(e);
    return Response.json({ siralama: [], kendiSiran: null });
  }
}
