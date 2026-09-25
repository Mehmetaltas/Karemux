import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { kurumYoneticisiCoz } from "@/lib/kurum";

// Kurum logosu - 25 Eylul: eskiden serbest metin URL alaniydi (SSRF/istismar
// riski - kurum yoneticisi HERHANGI bir dis URL yazip <img>'e koydurabiliyordu).
// Artik GERCEK dosya yuklemesi + Vercel Blob'a kaydediliyor - logo_url HER ZAMAN
// bizim kendi Blob depomuza ait bir adres oluyor, disaridan kontrol edilemez.
export const dynamic = "force-dynamic";
const IZINLI_TIPLER = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_BOYUT = 2 * 1024 * 1024; // 2MB

export async function POST(req) {
  try {
    const yonetici = await kurumYoneticisiCoz(req);
    if (!yonetici) return Response.json({ error: "Giris yapmis bir kurum yoneticisi olmalisin" }, { status: 401 });

    const form = await req.formData();
    const dosya = form.get("logo");
    if (!dosya || typeof dosya === "string") return Response.json({ error: "Logo dosyasi gerekli" }, { status: 400 });
    if (!IZINLI_TIPLER.includes(dosya.type)) return Response.json({ error: "Sadece PNG/JPEG/WEBP/SVG kabul edilir" }, { status: 400 });
    if (dosya.size > MAX_BOYUT) return Response.json({ error: "Logo en fazla 2MB olabilir" }, { status: 400 });

    const uzanti = dosya.type.split("/")[1].replace("svg+xml", "svg");
    const blob = await put(`kurum-logolari/${yonetici.kurumId}-${Date.now()}.${uzanti}`, dosya, {
      access: "public",
      addRandomSuffix: false,
    });

    await sql`UPDATE kurumlar SET logo_url = ${blob.url} WHERE id = ${yonetici.kurumId}`;
    return Response.json({ ok: true, logoUrl: blob.url });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Logo yuklenemedi" }, { status: 500 });
  }
}
