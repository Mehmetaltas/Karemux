import { sql } from "@/lib/db";
import { kullaniciIdCoz } from "@/lib/kullanici";

// P0 denetiminde bulundu (8 Eylul): app/page.js "Hedef Okul" ekrani (kendi
// mod'u var, il/ilce/okul/puan girip kaydediyor) bu route'u cagiriyordu ama
// hic olusturulmamisti - hem okuma hem kaydetme sessizce 404 donuyordu.
export async function GET(req) {
  try {
    const cihazId = new URL(req.url).searchParams.get("cihazId");
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ hedef: null });

    const sonuc = await sql`SELECT hedef_il, hedef_ilce, hedef_okul, hedef_puan FROM hedef_okul WHERE kullanici_id = ${kullaniciId}`;
    return Response.json({ hedef: sonuc[0] || null });
  } catch (e) {
    console.error(e);
    return Response.json({ hedef: null });
  }
}

export async function POST(req) {
  try {
    const { cihazId, hedefIl, hedefIlce, hedefOkul, hedefPuan } = await req.json();
    const kullaniciId = await kullaniciIdCoz(req, cihazId);
    if (!kullaniciId) return Response.json({ error: "Oturum bulunamadi" }, { status: 401 });

    await sql`
      INSERT INTO hedef_okul (kullanici_id, hedef_il, hedef_ilce, hedef_okul, hedef_puan)
      VALUES (${kullaniciId}, ${hedefIl || null}, ${hedefIlce || null}, ${hedefOkul || null}, ${hedefPuan || null})
      ON CONFLICT (kullanici_id) DO UPDATE SET
        hedef_il = ${hedefIl || null}, hedef_ilce = ${hedefIlce || null}, hedef_okul = ${hedefOkul || null}, hedef_puan = ${hedefPuan || null}, guncellenme = now()
    `;
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 500 });
  }
}
