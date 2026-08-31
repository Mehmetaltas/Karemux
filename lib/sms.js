// SMS Altyapisi (31 Agustos) - PASIF/HAZIR durumda kuruldu, henuz aktif
// SAGLAYICI YOK. Ileride bir SMS servisi (orn. Netgsm, Turkiye'de yaygin)
// entegre edilince SMS_SAGLAYICI_API_KEY env degiskeni eklenip
// smsGonder() icindeki gercek API cagrisi yazilmali - geri kalan sistem
// (ogretmenler.telefon/telefon_dogrulandi sutunlari, bu fonksiyonun
// cagrildigi yerler) o zaman hicbir degisiklik gerektirmeden calisir.

export function smsAktifMi() {
  return !!process.env.SMS_SAGLAYICI_API_KEY;
}

// Donus: { gonderildi: boolean, sebep?: string }
export async function smsGonder(telefonNumarasi, mesaj) {
  if (!smsAktifMi()) {
    console.warn(`SMS gonderilemedi (SMS_SAGLAYICI_API_KEY tanimli degil, altyapi PASIF): ${telefonNumarasi} -> "${mesaj}"`);
    return { gonderildi: false, sebep: "SMS saglayicisi henuz aktif degil" };
  }
  // TODO: gercek saglayici entegrasyonu (ornek: Netgsm REST API) buraya yazilacak.
  return { gonderildi: false, sebep: "SMS saglayici entegrasyonu henuz yazilmadi" };
}
