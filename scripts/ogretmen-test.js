// Ogretmen Materyal Aracinin 11 aracini gercekten cagirip dogrulayan otomasyon.
// GitHub Actions'ta duzenli calisir (gunluk). Gercek test ogretmen hesabiyla
// giris yapar, her aracin gercek bir cikti uretip uretmedigini kontrol eder,
// sonuclari admin panelin okuyabilecegi API'ye kaydeder.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karemux.com";

const TEST_EDILECEK = [
  { tur: "calisma_kagidi", sinif: 8, ders: "Matematik", konu: "Uslu Ifadeler" },
  { tur: "soru_seti", sinif: 8, ders: "Matematik", konu: "Uslu Ifadeler" },
  { tur: "yazili", sinif: 8, ders: "Fen Bilimleri", konu: "Basinc" },
  { tur: "fasikul", sinif: 8, ders: "Turkce", konu: "Fiilimsiler" },
  { tur: "kazanim_testi", sinif: 8, ders: "Matematik", konu: "Uslu Ifadeler" },
  { tur: "tekrar_paketi", sinif: 8, ders: "Fen Bilimleri", konu: "Basinc" },
  { tur: "odev_paketi", sinif: 5, ders: "Turkce", konu: "Oyun Dunyasi" },
  { tur: "brans_denemesi", sinif: 6, ders: "Ingilizce", konu: "School Life" },
  { tur: "eksik_konu_paketi", sinif: 8, ders: "Matematik", konu: "Uslu Ifadeler", ogretmenNotu: "Test: negatif uslerde hata yapiyor" },
  { tur: "veli_ozeti", sinif: 8, ders: "Matematik", konu: "Genel", ogretmenNotu: "Test: derse katilimi iyi" },
  { tur: "sinif_analizi", sinif: 8, ders: "Matematik", konu: "Genel", ogretmenNotu: "Test: sinif ortalamasi orta duzeyde" },
];

async function girisYap() {
  const res = await fetch(`${SITE_URL}/api/ogretmen/giris`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eposta: process.env.OGRETMEN_TEST_EPOSTA, sifre: process.env.OGRETMEN_TEST_SIFRE, beniHatirla: true }),
  });
  if (!res.ok) throw new Error(`Giris basarisiz: ${res.status}`);
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("Cookie alinamadi");
  return cookie.split(";")[0];
}

async function aracTestEt(cookie, tanim) {
  try {
    const res = await fetch(`${SITE_URL}/api/ogretmen/materyal-uret`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cookie": cookie },
      body: JSON.stringify(tanim),
    });
    const data = await res.json();
    if (!res.ok) return { tur: tanim.tur, basarili: false, hata: data.error || `HTTP ${res.status}` };

    const gecerliMi = data.materyal?.icerik || (Array.isArray(data.materyal?.sorular) && data.materyal.sorular.length > 0);
    if (!gecerliMi) return { tur: tanim.tur, basarili: false, hata: "Bos/gecersiz materyal donduruldu" };

    return { tur: tanim.tur, basarili: true };
  } catch (e) {
    return { tur: tanim.tur, basarili: false, hata: e.message };
  }
}

async function calistir() {
  console.log("Ogretmen test otomasyonu basliyor...");
  const cookie = await girisYap();
  console.log("Giris basarili.");

  const sonuclar = [];
  for (const tanim of TEST_EDILECEK) {
    console.log(`Test ediliyor: ${tanim.tur}...`);
    const sonuc = await aracTestEt(cookie, tanim);
    sonuclar.push(sonuc);
    console.log(sonuc.basarili ? `  OK` : `  BASARISIZ: ${sonuc.hata}`);
  }

  await fetch(`${SITE_URL}/api/cron/ogretmen-test-sonuc`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OGRETMEN_TEST_SONUC_ANAHTARI}` },
    body: JSON.stringify({ sonuclar }),
  });

  const basarisizlar = sonuclar.filter((s) => !s.basarili);
  console.log(`\nSonuc: ${sonuclar.length - basarisizlar.length}/${sonuclar.length} basarili.`);
  if (basarisizlar.length > 0) {
    console.error("BASARISIZ ARACLAR:", basarisizlar.map((s) => s.tur).join(", "));
    process.exit(1);
  }
}

calistir().catch((e) => { console.error("Test calistirilamadi:", e); process.exit(1); });
