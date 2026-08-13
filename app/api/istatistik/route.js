import { sql } from "@/lib/db";

// Ana ekranda "Y konu, X soru bankasi" gibi gercek, canli buyuyen sayilari
// gostermek icin. 10 dakika onbelleklenir - her sayfa yuklemesinde
// veritabanina gitmesin diye.
export const revalidate = 600;

export async function GET() {
  try {
    const soruBankasi = await sql`SELECT COUNT(*)::int as toplam FROM soru_bankasi`;
    const cozulenSoru = await sql`SELECT COALESCE(SUM(dogru + yanlis + bos), 0)::int as toplam FROM sinav_sonuclari`;
    const kayitliKullanici = await sql`SELECT COUNT(*)::int as toplam FROM kullanicilar WHERE sifre_hash != 'anon'`;

    return Response.json({
      soruBankasiToplam: soruBankasi[0].toplam,
      cozulenSoruToplam: cozulenSoru[0].toplam,
      kayitliKullaniciToplam: kayitliKullanici[0].toplam,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ soruBankasiToplam: 0, cozulenSoruToplam: 0, kayitliKullaniciToplam: 0 });
  }
}
