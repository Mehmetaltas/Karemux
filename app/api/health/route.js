import { sql } from "@/lib/db";

// Basit ama gercek bir "her sey calisiyor mu" kontrolu. Otomatik "kendini
// duzeltme" degil - ama bir sey bozulunca (veritabani baglantisi kopar, kritik
// bir ortam degiskeni silinir vb.) bunu ANINDA, insan mudahalesi beklemeden
// GOREBILMEK icin. /api/health adresine gidip (ya da bir izleme aracina
// baglayip) periyodik kontrol edilebilir.
export async function GET() {
  const sonuclar = {};
  let tumuSaglikli = true;

  // 1) Veritabani baglantisi gercekten calisiyor mu
  try {
    await sql`SELECT 1`;
    sonuclar.veritabani = "ok";
  } catch (e) {
    sonuclar.veritabani = "HATA: " + e.message;
    tumuSaglikli = false;
  }

  // 2) Kritik ortam degiskenleri tanimli mi (deger sizdirmadan, sadece var/yok)
  const kritikDegiskenler = [
    "DATABASE_URL", "JWT_SECRET", "RESEND_API_KEY",
    "GEMINI_API_KEY", "ANTHROPIC_API_KEY",
  ];
  const eksikDegiskenler = kritikDegiskenler.filter((d) => !process.env[d]);
  sonuclar.ortamDegiskenleri = eksikDegiskenler.length === 0 ? "ok" : `EKSIK: ${eksikDegiskenler.join(", ")}`;
  if (eksikDegiskenler.length > 0) tumuSaglikli = false;

  // 3) En az bir AI saglayicisi var mi (hicbiri yoksa sistem soru uretemez)
  const aiSaglayicilari = ["GEMINI_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "ANTHROPIC_API_KEY"].filter((d) => process.env[d]);
  sonuclar.aiSaglayiciSayisi = aiSaglayicilari.length;
  if (aiSaglayicilari.length === 0) tumuSaglikli = false;

  return Response.json({ durum: tumuSaglikli ? "saglikli" : "sorun_var", detaylar: sonuclar, zaman: new Date().toISOString() },
    { status: tumuSaglikli ? 200 : 503 });
}
