// GECICI TANI UC NOKTASI - OpenRouter'in gercek, canli ucretsiz model listesini
// gormek icin (tahmin etmek yerine). Is bitince silinecek.
export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    const data = await res.json();
    const ucretsizler = (data.data || [])
      .filter((m) => m.id.endsWith(":free"))
      .filter((m) => !/qwen3|nemotron|reasoning|thinking|r1/i.test(m.id)) // dusunme modellerini ele - bos icerik riski
      .map((m) => m.id);
    return Response.json({ toplamUcretsizModel: ucretsizler.length, ilk20: ucretsizler.slice(0, 20) });
  } catch (e) {
    return Response.json({ hataMetni: e.message }, { status: 500 });
  }
}
