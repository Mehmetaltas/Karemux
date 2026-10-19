// Faz E kilitleme (19 Ekim): bu uc herkese acik olarak dogruIndex (cevap anahtari)
// ve aciklamayi donduruyordu. Bankadan soru cekme artik sadece sunucu tarafinda
// (lib/pratik-uretimi.js bankadanSoruGetir) yapilir; istemciye anahtarsiz gider.
export async function GET() {
  return Response.json({ sorular: [], yeterliMi: false, error: "Bu uc nokta kapatildi" }, { status: 410 });
}
