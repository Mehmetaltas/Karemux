import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { sql } from "@/lib/db";

// Personel (admin/calisan) icin parmak izi / yuz / guvenlik anahtari (WebAuthn, "passkey") ikinci adimi.
// KURAL: ikinci adim YALNIZ en az bir passkey kaydetmis personel icin zorunludur; kaydetmeyenin girisi degismez.
// Kurtarma (kilitlenme): Neon'da  DELETE FROM personel_passkey WHERE personel_id = <id>;  yazilirsa kisi yeniden sifreyle girer.
export const RP_ADI = "Karemux";
export const RP_ID = process.env.WEBAUTHN_RP_ID || "karemux.com";
export const IZINLI_ORIGINLER = (process.env.WEBAUTHN_ORIGINS || "https://www.karemux.com,https://karemux.com").split(",").map((s) => s.trim()).filter(Boolean);

let hazir = false;
export async function webauthnTablolariHazirla() {
  if (hazir) return;
  await sql`CREATE TABLE IF NOT EXISTS personel_passkey (
    id serial PRIMARY KEY,
    personel_id integer NOT NULL,
    kimlik text NOT NULL UNIQUE,
    genel_anahtar text NOT NULL,
    sayac bigint NOT NULL DEFAULT 0,
    transports text,
    ad text,
    olusturulma timestamptz NOT NULL DEFAULT now(),
    son_kullanim timestamptz
  )`;
  await sql`CREATE TABLE IF NOT EXISTS webauthn_challenge (
    id serial PRIMARY KEY,
    personel_id integer NOT NULL,
    amac text NOT NULL,
    challenge text NOT NULL,
    bitis timestamptz NOT NULL
  )`;
  hazir = true;
}

export async function passkeyleriGetir(personelId) {
  await webauthnTablolariHazirla();
  return sql`SELECT id, kimlik, genel_anahtar, sayac, transports, ad, olusturulma, son_kullanim FROM personel_passkey WHERE personel_id = ${personelId} ORDER BY id`;
}

export async function challengeKaydet(personelId, amac, challenge) {
  await webauthnTablolariHazirla();
  await sql`DELETE FROM webauthn_challenge WHERE bitis < now() OR (personel_id = ${personelId} AND amac = ${amac})`;
  await sql`INSERT INTO webauthn_challenge (personel_id, amac, challenge, bitis) VALUES (${personelId}, ${amac}, ${challenge}, now() + interval '5 minutes')`;
}

// Tek kullanimlik: okununca silinir.
export async function challengeTuket(personelId, amac) {
  await webauthnTablolariHazirla();
  const r = await sql`DELETE FROM webauthn_challenge WHERE personel_id = ${personelId} AND amac = ${amac} AND bitis > now() RETURNING challenge`;
  return r[0]?.challenge || null;
}

const JWT_SECRET = process.env.JWT_SECRET;
// Sifre dogrulandi ama passkey bekleniyor: 5 dakikalik, yalniz bu amac icin gecerli gecici belge (oturum degildir).
export function geciciPasskeyTokenUret(personelId) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET tanımlı değil");
  return jwt.sign({ personelId, amac: "passkey_ikinci_adim", n: randomBytes(8).toString("hex") }, JWT_SECRET, { expiresIn: "5m" });
}
export function geciciPasskeyTokenCoz(token) {
  try {
    const v = jwt.verify(token, JWT_SECRET);
    return v?.amac === "passkey_ikinci_adim" && Number.isInteger(v.personelId) ? v.personelId : null;
  } catch { return null; }
}

export const b64uToBytes = (s) => new Uint8Array(Buffer.from(s, "base64url"));
export const bytesToB64u = (b) => Buffer.from(b).toString("base64url");
