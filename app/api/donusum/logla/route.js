import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// Satis Donusum Hunisi (7 Eylul) - sadece VAR OLMAYAN ara adimlari yakalar
// (ziyaret, premium inceleme, satin alma baslatildi). Odeme/abonelik/iade
// zaten kendi tablolarinda gercek veri olarak var, tekrar loglanmiyor.
// Sessiz/best-effort - basarisiz olursa kullaniciyi hic etkilemez.
const GECERLI_OLAYLAR = ["ziyaret", "premium_inceleme", "satin_alma_baslatildi"];

export async function POST(req) {
  try {
    const { cihazId, olayTuru, meta } = await req.json();
    if (!GECERLI_OLAYLAR.includes(olayTuru)) {
      return Response.json({ error: "Gecersiz olay turu" }, { status: 400 });
    }

    let kullaniciId = null;
    try { kullaniciId = await kullaniciIdCoz(req, cihazId); } catch (e) {}

    await sql`
      INSERT INTO donusum_olayi (cihaz_id, kullanici_id, olay_turu, meta)
      VALUES (${cihazId || null}, ${kullaniciId}, ${olayTuru}, ${meta ? JSON.stringify(meta) : null})
    `;

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false });
  }
}
