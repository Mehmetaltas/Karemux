// GECICI TANI UC NOKTASI - is bitince silinecek.
export async function GET(req) {
  const yetki = req.headers.get("authorization");
  if (yetki !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens: 50, messages: [{ role: "user", content: "Merhaba, sadece 'test basarili' yaz" }] }),
    });
    const hamMetin = await res.text();
    return Response.json({ modelKullanilan: model, httpDurum: res.status, hamYanit: hamMetin });
  } catch (e) {
    return Response.json({ hataMetni: e.message }, { status: 500 });
  }
}
