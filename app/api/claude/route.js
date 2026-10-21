// Faz 2 (21 Ekim): genel yapay zeka vekili KALDIRILDI. Istemci artik serbest prompt gonderemez;
// yapay zeka istekleri /api/ai-islem (islem kodu + yapisal girdi, prompt sunucuda), ucretli ozellikler
// /api/ucretli-uret uzerinden gider. Eski (guncellenmemis) sekmeler bu cevabi alir.
export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json({ error: "Bu uc kapatildi. Sayfayi yenileyip tekrar dene." }, { status: 410 });
}
