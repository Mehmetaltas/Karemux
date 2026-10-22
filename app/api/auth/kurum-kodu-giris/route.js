import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { okulNoTablosuHazirla, okulNoTemizle } from "@/lib/okul-no";
import { POST as epostaIleGiris } from "../login/route";

// Kurum kodu + okul no + sifre ile giris. Kimlik cozumlenip mevcut girisin (sifre kontrolu,
// deneme siniri, e-posta 2. adim kodu) AYNI yolundan gecirilir; yeni bir guvenlik yolu acilmaz.
const HATA = "Kurum kodu, okul no veya şifre hatalı";

export async function POST(req) {
  try {
    const { kurumKodu, okulNo, sifre, beniHatirla } = await req.json();
    const kod = String(kurumKodu || "").trim().toUpperCase();
    const no = okulNoTemizle(okulNo);
    if (!kod || !no || !sifre) return Response.json({ error: "Kurum kodu, okul no ve şifre gerekli" }, { status: 400 });

    const anahtar = `kurum:${kod}:${no}`;
    const ip = istekIpAdresi(req);
    const [a, b] = [await denemeSiniriKontrolEt(anahtar, "login"), await denemeSiniriKontrolEt(ip, "login")];
    if (!a.izinVar || !b.izinVar) return Response.json({ error: "Çok fazla başarısız deneme yapıldı. 15 dakika sonra tekrar dene." }, { status: 429 });

    await okulNoTablosuHazirla();
    const r = await sql`
      SELECT k.eposta FROM kurum_okul_no n
      JOIN kurumlar u ON u.id = n.kurum_id
      JOIN kullanicilar k ON k.id = n.kullanici_id AND k.kurum_id = n.kurum_id AND k.rol = 'ogrenci'
      WHERE u.kurum_kodu = ${kod} AND n.okul_no = ${no}`;
    if (r.length === 0) {
      await denemeKaydet(anahtar, "login", false);
      await denemeKaydet(ip, "login", false);
      return Response.json({ error: HATA }, { status: 401 });
    }

    const yeni = new Request(req.url, { method: "POST", headers: req.headers, body: JSON.stringify({ eposta: r[0].eposta, sifre, beniHatirla }) });
    const cevap = await epostaIleGiris(yeni);
    if (cevap.status === 401) {
      await denemeKaydet(anahtar, "login", false);
      return Response.json({ error: HATA }, { status: 401 });
    }
    return cevap;
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Giriş yapılamadı" }, { status: 500 });
  }
}
