import { sql } from "@/lib/db";
import { sifreHashle, veliBaglantiKoduUret } from "@/lib/auth";
import { personelAdminMi } from "@/lib/personel";

// Tek seferlik test-hesabi kurulum araci (11 Eylul) - Gmail "+" etiketleme
// ile 4 rolun test hesaplarini TEK, cakismasiz seferde acar.
export async function GET(req) {
  if (!(await personelAdminMi(req))) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const sifre = "mehmetaltas42";
  const hash = await sifreHashle(sifre);
  const sonuc = {};

  try {
    // Onceki varsa temizle (tek kayit garantisi)
    for (const e of ["karemuxegitim+ogrenci@gmail.com", "karemuxegitim+veli@gmail.com", "karemuxegitim+kurum@gmail.com"]) {
      const eski = await sql`SELECT id FROM kullanicilar WHERE eposta = ${e}`;
      if (eski.length > 0) {
        const id = eski[0].id;
        await sql`DELETE FROM veli_ogrenci WHERE veli_id = ${id} OR ogrenci_id = ${id}`;
        await sql`DELETE FROM kurumlar WHERE yonetici_id = ${id}`;
        await sql`DELETE FROM kullanicilar WHERE id = ${id}`;
      }
    }
    const eskiOgretmen = await sql`SELECT id FROM ogretmenler WHERE eposta = ${"karemuxegitim+ogretmen@gmail.com"}`;
    if (eskiOgretmen.length > 0) await sql`DELETE FROM ogretmenler WHERE id = ${eskiOgretmen[0].id}`;

    // 1. Ogrenci
    const ogrenci = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, sinif, veli_eposta, veli_onay_verildi, veli_baglanti_kodu)
      VALUES (${"karemuxegitim+ogrenci@gmail.com"}, ${hash}, 'Test Ogrenci', 'ogrenci', '8', ${"karemuxegitim+veli@gmail.com"}, true, ${veliBaglantiKoduUret()})
      RETURNING id
    `;
    sonuc.ogrenci = { eposta: "karemuxegitim+ogrenci@gmail.com", id: ogrenci[0].id, sifre };

    // 2. Veli (ogrenciyle bagli)
    const veli = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol)
      VALUES (${"karemuxegitim+veli@gmail.com"}, ${hash}, 'Test Veli', 'veli')
      RETURNING id
    `;
    await sql`INSERT INTO veli_ogrenci (veli_id, ogrenci_id) VALUES (${veli[0].id}, ${ogrenci[0].id})`;
    sonuc.veli = { eposta: "karemuxegitim+veli@gmail.com", id: veli[0].id, sifre };

    // 3. Kurum
    const kod = veliBaglantiKoduUret();
    const kurumKayit = await sql`INSERT INTO kurumlar (ad, kurum_kodu) VALUES ('Test Kurum', ${kod}) RETURNING id`;
    const kurumYonetici = await sql`
      INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol, kurum_id, veli_onay_verildi)
      VALUES (${"karemuxegitim+kurum@gmail.com"}, ${hash}, 'Test Kurum Yoneticisi', 'kurum_yoneticisi', ${kurumKayit[0].id}, true)
      RETURNING id
    `;
    sonuc.kurum = { eposta: "karemuxegitim+kurum@gmail.com", id: kurumYonetici[0].id, kurumKodu: kod, sifre };

    // 4. Ogretmen (ayri tablo, aktif=true - direkt giris yapabilir)
    const ogretmen = await sql`
      INSERT INTO ogretmenler (ad, brans, eposta, sifre_hash, aktif)
      VALUES ('Test Ogretmen', 'Matematik', ${"karemuxegitim+ogretmen@gmail.com"}, ${hash}, true)
      RETURNING id
    `;
    sonuc.ogretmen = { eposta: "karemuxegitim+ogretmen@gmail.com", id: ogretmen[0].id, sifre };

    return Response.json({ ok: true, hesaplar: sonuc });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message, kismiSonuc: sonuc }, { status: 500 });
  }
}
