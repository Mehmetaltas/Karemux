import { sql } from "@/lib/db";

export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token");
  const basitSayfa = (baslik, mesaj) => new Response(
    `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>${baslik}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:0 20px;text-align:center;color:#1B2430}
    h1{font-size:22px}p{color:#6B7566;line-height:1.6}</style></head>
    <body><h1>${baslik}</h1><p>${mesaj}</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

  if (!token) return basitSayfa("Geçersiz Bağlantı", "Onay linki eksik veya hatalı.");

  try {
    const kullanici = await sql`SELECT id, ad, veli_onay_verildi FROM kullanicilar WHERE veli_onay_token = ${token}`;
    if (kullanici.length === 0) {
      return basitSayfa("Geçersiz veya Süresi Dolmuş", "Bu onay linki geçerli değil. Belki daha önce kullanıldı.");
    }
    if (kullanici[0].veli_onay_verildi) {
      return basitSayfa("Zaten Onaylanmış", `${kullanici[0].ad} için hesap zaten önceden onaylanmış.`);
    }
    await sql`UPDATE kullanicilar SET veli_onay_verildi = true, veli_onay_token = NULL WHERE id = ${kullanici[0].id}`;
    return basitSayfa("Onaylandı ✓", `${kullanici[0].ad} artık Karemux'u kullanabilir. Bu sayfayı kapatabilirsiniz.`);
  } catch (e) {
    console.error(e);
    return basitSayfa("Bir Sorun Oluştu", "Onay işlemi tamamlanamadı, lütfen tekrar deneyin.");
  }
}
