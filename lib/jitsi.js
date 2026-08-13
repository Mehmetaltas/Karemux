// Jitsi Meet (meet.jit.si) - TAMAMEN UCRETSIZ, hesap/API anahtari GEREKMEZ.
// Benzersiz bir oda adi uretip URL olarak dondurmek yeterli - Jitsi'nin kendi
// sunucusu o oda adiyla otomatik bir gorusme odasi acar. Herhangi bir kurulum,
// OAuth, hesap olusturma gerekmiyor.
export function jitsiToplantisiOlustur({ ogretmenAdi, ogrenciId, baslangicISO }) {
  // Oda adi tahmin edilemez/benzersiz olsun diye rastgele bir kod ekleniyor -
  // boylece baskasi ayni linke kazara girmez.
  const rastgeleKod = Math.random().toString(36).slice(2, 10);
  const odaAdi = `Karemux-${ogrenciId}-${rastgeleKod}`.replace(/[^a-zA-Z0-9-]/g, "");
  const link = `https://meet.jit.si/${odaAdi}`;
  return { link, meetingId: odaAdi };
}
