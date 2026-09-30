import { sql } from "@/lib/db";

// 30 Eylul: Aylik temizlik - odeme "izlerinin" surekli birikip cop olmasini
// onler, ama GERCEK finansal kayitlara (basarili/iade_edildi) HICBIR ZAMAN
// dokunmaz - bunlar kalici muhasebe geçmisidir.
//
// Kural: 30 gunden eski "beklemede" (hic sonuclanmamis) once "basarisiz"
// isaretlenir (zaman asimi - gercek bir odeme yontemi bu kadar suremez).
// 90 gunden eski "basarisiz" kayitlar SILINIR (bir ceyrek boyunca analiz/
// itiraz penceresi tanindi, sonrasinda gerçek karsiligi olmayan veridir).
export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const zamanAsimi = await sql`
      UPDATE odemeler SET durum = 'basarisiz'
      WHERE durum = 'beklemede' AND olusturulma < now() - interval '30 days'
      RETURNING id
    `;

    const silinen = await sql`
      DELETE FROM odemeler
      WHERE durum = 'basarisiz' AND olusturulma < now() - interval '90 days'
      RETURNING id
    `;

    if (zamanAsimi.length > 0 || silinen.length > 0) {
      await sql`
        INSERT INTO muhasebe_islem_gecmisi (personel_ad, islem_turu, detay)
        VALUES ('Otomatik Sistem', 'odeme_temizlik', ${`${zamanAsimi.length} odeme zaman asimina ugradi, ${silinen.length} eski basarisiz kayit silindi`})
      `;
    }

    return Response.json({ ok: true, zamanAsimindaOlan: zamanAsimi.length, silinen: silinen.length });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
