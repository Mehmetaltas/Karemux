import { ogretmenCoz } from "@/lib/ogretmen";
import { uniteleriGetir } from "@/lib/mufredat-veri";

// Ogretmenin materyal uretirken gercek, TAM (5-8. sinif) mufredat
// unitelerinden secim yapabilmesi icin - ana ogrenci uygulamasindaki
// MUFREDAT sabitinin ayni kopyasindan besleniyor (lib/mufredat-veri.js).
export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sinif = searchParams.get("sinif");
  const ders = searchParams.get("ders");
  if (!sinif || !ders) return Response.json({ error: "sinif ve ders gerekli" }, { status: 400 });

  return Response.json({ uniteler: uniteleriGetir(sinif, ders) });
}
