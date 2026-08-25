import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET;

// Personel (admin/calisan) oturumu - kullanicilar'dan AYRI cookie kullanir,
// karisma riski olmasin diye. Ayni JWT_SECRET tekrar kullanilir (guvenlik
// acisindan sorun degil, farkli cookie adi zaten ayrimi sagliyor).
export function personelTokenUret(personelId) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET tanımlı değil");
  return jwt.sign({ personelId }, JWT_SECRET, { expiresIn: "7d" });
}

function personelTokenDogrula(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function personelOturumCookieBaslik(token) {
  return `karemux_personel_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}

export function personelCikisCookieBaslik() {
  return `karemux_personel_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function cookieOku(req, ad) {
  const cookie = req.headers.get("cookie") || "";
  const eslesme = cookie.match(new RegExp(`${ad}=([^;]+)`));
  return eslesme ? eslesme[1] : null;
}

// Giris yapmis personelin TAM kaydini (ad/rol dahil) dondurur - sadece ID degil,
// cunku admin ekranlari genelde "Hos geldin [ad]" gibi gosterimler icerecek.
export async function personelCoz(req) {
  const veri = personelTokenDogrula(cookieOku(req, "karemux_personel_token"));
  if (!veri?.personelId) return null;
  const sonuc = await sql`SELECT id, ad, eposta, rol FROM personel WHERE id = ${veri.personelId} AND aktif = true`;
  return sonuc[0] || null;
}

// Mali/hassas admin uc noktalari icin: sadece rol='admin' olan personel gecsin.
// KOPRU (?sifre=) her basarili girisi (calisan dahil) gecirdigi icin, gercek
// hassasiyet ayrimi burada, kimlik dogrulanmis personelin ROLUNE bakarak yapiliyor.
export async function personelAdminMi(req) {
  const personel = await personelCoz(req);
  return personel?.rol === "admin";
}
