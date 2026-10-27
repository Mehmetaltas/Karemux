import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function sifreHashle(sifre) {
  return bcrypt.hash(sifre, 10);
}

export async function sifreDogrula(sifre, hash) {
  return bcrypt.compare(sifre, hash);
}

export function tokenUret(kullaniciId) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET tanımlı değil");
  return jwt.sign({ kullaniciId }, JWT_SECRET, { expiresIn: "30d" });
}

export function tokenDogrula(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// 27 Ekim: Domain=.karemux.com yalniz karemux.com alt alanlarinda kabul edilir. Site baska bir adresten
// (ornegin *.vercel.app) acilinca tarayici cerezi reddediyor, kod dogru olsa bile giris tutmuyordu.
// req verilirse ve host karemux.com ile bitmiyorsa Domain yazilmaz (cerez o host'a ozel olur).
function cerezDomain(req) {
  try {
    const host = (req?.headers?.get("x-forwarded-host") || req?.headers?.get("host") || "").split(":")[0].toLowerCase();
    if (host && host !== "karemux.com" && !host.endsWith(".karemux.com")) return "";
  } catch (e) {}
  return "Domain=.karemux.com; ";
}

export function oturumCookieBaslik(token, _beniHatirla, req) {
  // 5 Eylul: "Beni Hatirla" artik cerezi UZATMIYOR - her zaman sadece
  // oturum cerezi (tarayici/app tam kapaninca silinir). Kalicilik istegi
  // artik client tarafinda localStorage'a (SADECE eposta+sifre onizleme
  // icin, oturum acmak icin degil) tasindi - kullanici her zaman "Giris
  // Yap"a basmak zorunda, sessizce sonsuza kadar giris kalmiyor.
  return `karemux_token=${token}; ${cerezDomain(req)}HttpOnly; Secure; SameSite=Lax; Path=/`;
}

export function cikisCookieBaslik(req) {
  return `karemux_token=; ${cerezDomain(req)}HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function altiHaneliKodUret() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function veliBaglantiKoduUret() {
  // Karışıklık yaratabilecek karakterleri (0/O, 1/I) çıkardık
  const havuz = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let kod = "";
  for (let i = 0; i < 8; i++) kod += havuz[Math.floor(Math.random() * havuz.length)];
  return kod;
}

export function veliOnayTokenUret() {
  const havuz = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 40; i++) token += havuz[Math.floor(Math.random() * havuz.length)];
  return token;
}

export function cookieOku(req, ad) {
  const cookie = req.headers.get("cookie") || "";
  const eslesme = cookie.match(new RegExp(`${ad}=([^;]+)`));
  return eslesme ? eslesme[1] : null;
}

export function oturumdanKullaniciId(req) {
  const veri = tokenDogrula(cookieOku(req, "karemux_token"));
  return veri?.kullaniciId || null;
}
