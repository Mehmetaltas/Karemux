import { sql } from "@/lib/db";

// Veli onay e-postasindaki linke tiklandiktan sonra yonlendirilen
// /veli-hesap-olustur sayfasi bu route ile token'i dogrulayip ogrenci
// adi+veli epostasini gosterir (10-11 Eylul, hesap acilma boslugu).
export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Gecersiz baglanti" }, { status: 400 });

  try {
    const sonuc = await sql`SELECT ad, veli_eposta, veli_onay_verildi FROM kullanicilar WHERE veli_onay_token = ${token}`;
    if (sonuc.length === 0) {
      return Response.json({ error: "Bu onay linki gecersiz veya suresi dolmus." }, { status: 404 });
    }
    if (sonuc[0].veli_onay_verildi) {
      return Response.json({ error: "Bu hesap zaten onaylanmis. Giris sayfasindan devam edebilirsin." }, { status: 409 });
    }
    return Response.json({ ogrenciAdi: sonuc[0].ad, veliEposta: sonuc[0].veli_eposta });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Bir sorun olustu." }, { status: 500 });
  }
}
