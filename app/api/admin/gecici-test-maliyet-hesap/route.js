import { usdTryKuruGetir, GEMINI_3_6_FLASH_FIYAT } from "@/lib/ai-fiyatlandirma";

export async function GET() {
  const karakterSayisi = 1000; // ornek
  const KARAKTER_BASINA_TOKEN_TAHMINI = 1 / 3.7;
  const tahminiToken = Math.round(karakterSayisi * KARAKTER_BASINA_TOKEN_TAHMINI);

  // ESKI (hatali) hesaplama
  const ESKI_USD_TRY = 47.93;
  const ESKI_CIKTI_FIYAT = 7.50; // 2027 standart fiyati, simdiki gercek maliyetin ~2x fazlasi
  const eskiMaliyet = Math.round((tahminiToken / 1_000_000) * ESKI_CIKTI_FIYAT * ESKI_USD_TRY * 10000) / 10000;

  // YENI (dogru) hesaplama
  const kur = await usdTryKuruGetir();
  const yeniMaliyet = Math.round((tahminiToken / 1_000_000) * GEMINI_3_6_FLASH_FIYAT.ciktiUsdMtok * kur * 10000) / 10000;

  return Response.json({
    tahminiToken,
    canliKur: kur,
    eskiMaliyetTl: eskiMaliyet,
    yeniMaliyetTl: yeniMaliyet,
    oran: Math.round((eskiMaliyet / yeniMaliyet) * 100) / 100,
    aciklama: "oran ~2'ye yakin olmali (eski fiyat 2x fazlaydi), eskiMaliyet > yeniMaliyet olmali",
  });
}
