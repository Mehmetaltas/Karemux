// Ogrenci taraf akislarini gercekten cagirip dogrulayan otomasyon (23 Eylul).
// Ogretmen tarafindaki (scripts/ogretmen-test.js) AYNI desen - Full Audit'te
// bulundu, ogrenci tarafinda hic otomatik test yoktu, canlı buglar aylarca
// fark edilmeden kalabilirdi. GitHub Actions'ta duzenli calisir.
// NOT: soru-coz (goruntu tabanli) bu ilk surumde YOK - gercek bir fotograf
// gerektiriyor, ayri/daha buyuk bir is; sadece metin tabanli akislar test edilir.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karemux.com";
// Sabit bir test cihaz kimligi - gercek bir kullanici degil, sadece
// gunlukLimitKontrolEt'in bir "kullanici" cozebilmesi icin. Hassas degil,
// secret olmasina gerek yok.
const TEST_CIHAZ_ID = "otomasyon-test-cihazi-23eylul";

const TEST_EDILECEK = [
  { tur: "konu_paketi", tip: "konu_paketi", sinif: 8, ders: "Matematik", konu: "Uslu Ifadeler", unite: "" },
  { tur: "konu_paketi_ingilizce", tip: "konu_paketi", sinif: 7, ders: "Ingilizce", konu: "Simple Present", unite: "" },
  { tur: "seviye_tespit", tip: "seviye_tespit", konular: [{ ders: "Matematik", unite: "Sayilar ve Nicelikler", sinif: 5 }] },
];

async function konuPaketiTestEt(tanim) {
  const url = `${SITE_URL}/api/konu-paketi?sinif=${tanim.sinif}&ders=${encodeURIComponent(tanim.ders)}&konu=${encodeURIComponent(tanim.konu)}&unite=${encodeURIComponent(tanim.unite || "")}&cihazId=${TEST_CIHAZ_ID}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) return { basarili: false, hata: data.error || `HTTP ${res.status}` };
  const gecerliMi = data.paket?.anlatim && Array.isArray(data.paket?.soruHavuzu) && data.paket.soruHavuzu.length > 0;
  if (!gecerliMi) return { basarili: false, hata: "Bos/gecersiz paket donduruldu" };
  return { basarili: true };
}

async function seviyeTespitTestEt(tanim) {
  const res = await fetch(`${SITE_URL}/api/seviye-tespit/olustur`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ konular: tanim.konular, cihazId: TEST_CIHAZ_ID }),
  });
  const data = await res.json();
  if (!res.ok) return { basarili: false, hata: data.error || `HTTP ${res.status}` };
  const gecerliMi = Array.isArray(data.sorular) && data.sorular.length > 0;
  if (!gecerliMi) return { basarili: false, hata: "Bos/gecersiz soru listesi donduruldu" };
  return { basarili: true };
}

async function aracTestEt(tanim) {
  try {
    const sonuc = tanim.tip === "seviye_tespit" ? await seviyeTespitTestEt(tanim) : await konuPaketiTestEt(tanim);
    return { tur: tanim.tur, ...sonuc };
  } catch (e) {
    return { tur: tanim.tur, basarili: false, hata: e.message };
  }
}

async function calistir() {
  console.log("Ogrenci test otomasyonu basliyor...");
  const sonuclar = [];
  for (const tanim of TEST_EDILECEK) {
    console.log(`Test ediliyor: ${tanim.tur}...`);
    const sonuc = await aracTestEt(tanim);
    sonuclar.push(sonuc);
    console.log(sonuc.basarili ? `  OK` : `  BASARISIZ: ${sonuc.hata}`);
    await new Promise((r) => setTimeout(r, 8000));
  }

  await fetch(`${SITE_URL}/api/cron/ogrenci-test-sonuc`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OGRENCI_TEST_SONUC_ANAHTARI}` },
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
