import { sql } from "@/lib/db";
import { oturumdanKullaniciId } from "@/lib/auth";

export async function GET(req) {
  try {
    const kullaniciId = oturumdanKullaniciId(req);
    if (!kullaniciId) return Response.json({ girisYapmis: false });

    const sonuc = await sql`
      SELECT id, ad, eposta, rol, eposta_dogrulandi, veli_baglanti_kodu, okul, telefon, sinif, il, veli_eposta, veli_onay_verildi, ek_roller
      FROM kullanicilar WHERE id = ${kullaniciId}
    `;
    if (!sonuc[0]) return Response.json({ girisYapmis: false });

    return Response.json({ girisYapmis: true, kullanici: sonuc[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ girisYapmis: false });
  }
}
