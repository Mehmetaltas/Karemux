import { sql } from "@/lib/db";
import { sifreDogrula, altiHaneliKodUret } from "@/lib/auth";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { resendIstemcisi } from "@/lib/email";

// 29 Eylul: e-posta 2FA ogretmen girisine de yayildi (Full Audit B.Auth
// bulgusu - eskiden SADECE ogrencide vardi). ogretmenler AYRI bir tablo
// (kullanicilar degil), o yuzden bu route kendi 2FA mantigini tasiyor -
// kod uretme+gonderme burada, dogrulama /api/ogretmen/giris-dogrula'da.
export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_giris", 5, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { eposta, sifre, otomasyonAnahtari } = await req.json();
    if (!eposta?.trim() || !sifre) return Response.json({ error: "Eposta ve sifre gerekli" }, { status: 400 });

    const ogretmen = await sql`SELECT id, ad, sifre_hash, brans FROM ogretmenler WHERE eposta = ${eposta.trim().toLowerCase()} AND aktif = true`;
    if (ogretmen.length === 0 || !ogretmen[0].sifre_hash) {
      await denemeKaydet(ip, "ogretmen_giris", false);
      return Response.json({ error: "Hatali eposta veya sifre" }, { status: 401 });
    }

    const dogru = await sifreDogrula(sifre, ogretmen[0].sifre_hash);
    if (!dogru) {
      await denemeKaydet(ip, "ogretmen_giris", false);
      return Response.json({ error: "Hatali eposta veya sifre" }, { status: 401 });
    }

    await denemeKaydet(ip, "ogretmen_giris", true);

    const kod = altiHaneliKodUret();
    const sonTarih = new Date(Date.now() + 10 * 60 * 1000);
    await sql`UPDATE ogretmenler SET giris_dogrulama_kodu = ${kod}, giris_dogrulama_son_tarih = ${sonTarih} WHERE id = ${ogretmen[0].id}`;

    try {
      await resendIstemcisi().emails.send({
        from: "Karemux <bildirim@karemux.com>",
        to: eposta.trim().toLowerCase(),
        subject: `Karemux ogretmen giris kodun: ${kod}`,
        text: `Merhaba,\n\nKaremux ogretmen paneline giris yapmak icin dogrulama kodun: ${kod}\n\nBu kod 10 dakika gecerlidir. Bu girisi sen yapmadiysan, bu e-postayi yok sayabilirsin.\n\nKaremux Ekibi`,
      });
    } catch (e) {
      console.error("Ogretmen 2FA e-postasi gonderilemedi:", e.message);
      return Response.json({ error: "Dogrulama kodu gonderilemedi, tekrar dene." }, { status: 502 });
    }

    // 29 Eylul: GitHub Actions gunluk otomasyonu (scripts/ogretmen-test.js) icin
    // TEK gercek test hesabina SADECE dogru sirla kod e-postanin YANINDA API
    // yanitinda da donuyor - CI kutuyu okuyamaz. Baska hicbir hesap icin
    // gecerli degil (eposta+sir ikisi de eslesmeli), gercek kullanicilari etkilemez.
    const otomasyonMu = otomasyonAnahtari && process.env.OGRETMEN_TEST_SONUC_ANAHTARI
      && otomasyonAnahtari === process.env.OGRETMEN_TEST_SONUC_ANAHTARI
      && eposta.trim().toLowerCase() === (process.env.OGRETMEN_TEST_EPOSTA || "").trim().toLowerCase();

    return Response.json({ ok: true, ikinciAdimGerekli: true, eposta: eposta.trim().toLowerCase(), ...(otomasyonMu ? { kodOnizleme: kod } : {}) });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Giris basarisiz" }, { status: 500 });
  }
}
