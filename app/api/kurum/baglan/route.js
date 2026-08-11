import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Ogrenci, kendi hesabini bir kurum koduyla bir kuruma baglar - boylece o kurum
// bu ogrencinin (anonimlestirilmis/toplu) verilerini raporunda gorebilir.
export async function POST(req) {
  try {
    const { kurumKodu, cihazId } = await req.json();
    if (!kurumKodu || !kurumKodu.trim()) return Response.json({ error: "Kurum kodu bos olamaz" }, { status: 400 });

    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Giris yapmalisin" }, { status: 401 });

    const kurum = await sql`SELECT id, ad FROM kurumlar WHERE kurum_kodu = ${kurumKodu.trim().toUpperCase()}`;
    if (kurum.length === 0) return Response.json({ error: "Bu kodla eslesen bir kurum bulunamadi" }, { status: 404 });

    await sql`UPDATE kullanicilar SET kurum_id = ${kurum[0].id} WHERE id = ${kullaniciId}`;
    return Response.json({ ok: true, kurumAdi: kurum[0].ad });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Baglanamadi" }, { status: 500 });
  }
}
