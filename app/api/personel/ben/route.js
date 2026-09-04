import { personelCoz } from "@/lib/personel";

// GERCEK oturum geri yukleme (4 Eylul): admin panel sayfa yenilenince
// "Beni Hatirla" isaretlenmis olsa bile giris ekranina donuyordu, cunku
// bu route sadece {girisYapmis, personel} donuyordu - paylasilan admin
// sifresini VERMIYORDU (personel/giris'in dondurdugu gibi). O sifre
// olmadan hicbir admin API cagrisi calismiyor. Simdi AYNI koprunun
// (bkz. personel/giris/route.js) gecerli oturum icin de calismasi
// saglaniyor - sadece rol='admin' icin (personelAdminMi ile ayni mantik).
export async function GET(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ girisYapmis: false });

  const sifre = personel.rol === "admin" ? process.env.ULUSAL_DENEME_YONETICI_SIFRESI : null;
  return Response.json({ girisYapmis: true, personel, sifre });
}
