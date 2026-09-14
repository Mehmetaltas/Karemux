// Tutarlilik Denetimi Otomasyonu (14 Eylul) - "Ingilizce'nin tek-seviyeli
// kaldigi fark edilmeden kalmasi" turunden zafiyetleri periyodik olarak
// otomatik yakalamak icin. Bulgu varsa exit code 1 verir (GitHub Actions
// bunu "basarisiz" gosterip e-posta bildirimi gonderir).

async function calistir() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const sifre = process.env.ULUSAL_DENEME_YONETICI_SIFRESI;
  if (!siteUrl || !sifre) {
    console.error("NEXT_PUBLIC_SITE_URL veya ULUSAL_DENEME_YONETICI_SIFRESI eksik");
    process.exit(1);
  }

  console.log("Tutarlilik denetimi baslatiliyor...");
  const res = await fetch(`${siteUrl}/api/admin/tutarlilik-denetimi?sifre=${encodeURIComponent(sifre)}`);
  const data = await res.json();

  if (!res.ok) {
    console.error("Denetim cagrisi basarisiz:", data.error || res.status);
    process.exit(1);
  }

  console.log(`Calisma zamani: ${data.calistirilmaZamani}`);
  console.log(`Toplam bulgu: ${data.toplamBulgu}`);

  if (data.toplamBulgu > 0) {
    console.log("BULGULAR:");
    for (const b of data.bulgular) {
      console.log(`  - [${b.tur}] ${JSON.stringify(b)}`);
    }
    console.error("Tutarsizlik bulundu, incelenmesi gerekiyor.");
    process.exit(1);
  }

  console.log("Tutarsizlik bulunamadi. Sistem saglikli.");
}

calistir().catch((e) => {
  console.error("Beklenmeyen hata:", e.message);
  process.exit(1);
});
