import { sql } from "@/lib/db";
import { veliBaglantiKoduUret } from "@/lib/auth";

// Herhangi biri (okul yoneticisi, kocluk merkezi vb.) bir "kurum" olusturup
// benzersiz bir kod alabilir. Bu kod, ogrencilerin kendi hesaplarini bu kuruma
// baglamasi ve kurumun toplu rapor gormesi icin kullanilir - veli baglanti kodu
// ile ayni guvenlik/kullanilabilirlik mantigi.
export async function POST(req) {
  try {
    const { ad } = await req.json();
    if (!ad || !ad.trim()) return Response.json({ error: "Kurum adi bos olamaz" }, { status: 400 });

    let kod, deneme = 0;
    let eklendi = false;
    let kurumId = null;
    while (!eklendi && deneme < 8) {
      kod = veliBaglantiKoduUret();
      try {
        const sonuc = await sql`INSERT INTO kurumlar (ad, kurum_kodu) VALUES (${ad.trim()}, ${kod}) RETURNING id`;
        kurumId = sonuc[0].id;
        eklendi = true;
      } catch (e) {
        deneme++; // kod cakismasi - tekrar dene (cok dusuk ihtimal)
      }
    }
    if (!eklendi) return Response.json({ error: "Kurum olusturulamadi, tekrar dene" }, { status: 500 });

    return Response.json({ kurumId, kurumKodu: kod, ad: ad.trim() });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Kurum olusturulamadi" }, { status: 500 });
  }
}
