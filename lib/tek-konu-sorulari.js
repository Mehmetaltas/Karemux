// Faz E - TEK KONU ekraninin sorulari SUNUCUDA hazirlanir (eskiden tarayici hazirliyor, dogruIndex
// ile birlikte /api/tek-konu/oturum-olustur'a gonderiyordu: ogrenci kendi cevap anahtarini yazabiliyordu).
// Once ogretmen onayli konu havuzu (AI'ya gitmez), yetmezse AI + bagimsiz denetim.
import { aiCagir } from "@/lib/ai";
import { soruTalimatiSecSunucu } from "@/lib/soru-talimati-sunucu";
import { hamdanDenetliye } from "@/lib/soru-hatti";
import { jsonMetniTemizle, soruJsonAyikla, sinavSorusuGecerliMi } from "@/lib/sinav-uretimi";
import { konuPromptuOlustur, onayliKonuHavuzu } from "@/lib/pratik-uretimi";

export const TEK_KONU_SORU_SAYISI = 10;
const ASGARI_ORAN = 0.6;

// Onayli havuz yeterliyse AI'sizdir. havuzYeterli false ise AI gerekir (cagiran limit kontrolu yapabilsin).
export async function tekKonuHavuzdanGetir({ sinif, ders, unite, konu }) {
  const havuz = await onayliKonuHavuzu({ sinif, ders, unite, konu });
  return havuz.length >= TEK_KONU_SORU_SAYISI ? havuz.slice(0, 15) : null;
}

export async function tekKonuSorulariUret({ sinif, ders, unite, konu }) {
  const soruTalimati = await soruTalimatiSecSunucu(sinif);
  const istem = konuPromptuOlustur({ ders, sinif, konu, unite, fasikul: true, partiNo: 0, soruTalimati });
  const cevap = await aiCagir({ prompt: istem, maxTokens: Math.min(8000, 500 + TEK_KONU_SORU_SAYISI * 480), jsonModu: true, tur: "tek_konu_uretimi" });
  const ham = soruJsonAyikla(jsonMetniTemizle(cevap, { dilFiltresi: true, parantezTemizle: true }));
  const asgari = Math.ceil(TEK_KONU_SORU_SAYISI * ASGARI_ORAN);
  const { sorular: gecen } = await hamdanDenetliye(ham, {
    suzgec: sinavSorusuGecerliMi, azami: TEK_KONU_SORU_SAYISI, asgari,
    baglam: `Bu sorular "${ders}" dersi ${sinif}. sinif "${konu}" konusu icin, ogrenciye dogrudan gosterilecek, cok yuksek dogruluk gerekiyor.`,
    hamHata: "Yeterli gecerli soru uretilemedi",
  });
  const sorular = gecen.map((s) => ({ ...s, altKonu: (typeof s.altKonu === "string" && s.altKonu.trim() ? s.altKonu.trim().slice(0, 150) : konu) }));
  return sorular;
}
