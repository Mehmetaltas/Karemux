import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET;

// Ogretmen oturumu - personel'den TAMAMEN AYRI cookie/tablo kullanir (31
// Agustos, lib/personel.js'in kanitlanmis deseninin birebir kopyasi).
export function ogretmenTokenUret(ogretmenId) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET tanımlı değil");
  return jwt.sign({ ogretmenId }, JWT_SECRET, { expiresIn: "30d" });
}

function ogretmenTokenDogrula(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function ogretmenOturumCookieBaslik(token) {
  return `karemux_ogretmen_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`;
}

export function ogretmenCikisCookieBaslik() {
  return `karemux_ogretmen_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function cookieOku(req, ad) {
  const cookie = req.headers.get("cookie") || "";
  const eslesme = cookie.match(new RegExp(`${ad}=([^;]+)`));
  return eslesme ? eslesme[1] : null;
}

export async function ogretmenCoz(req) {
  const veri = ogretmenTokenDogrula(cookieOku(req, "karemux_ogretmen_token"));
  if (!veri?.ogretmenId) return null;
  const sonuc = await sql`SELECT id, ad, eposta, brans FROM ogretmenler WHERE id = ${veri.ogretmenId} AND aktif = true`;
  return sonuc[0] || null;
}
