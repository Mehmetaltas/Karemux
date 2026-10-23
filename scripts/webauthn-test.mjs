// WebAuthn uctan uca sunucu dogrulama testi: yazilim "authenticator" ile kayit + giris + sayac + yanlis origin/challenge reddi.
// Calistirma: node scripts/webauthn-test.mjs  (npm ci sonrasi). Hata varsa cikis kodu 1 ve ::error satiri basar.
import crypto from "node:crypto";
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";

const RP_ID = "karemux.com", ORIGIN = "https://www.karemux.com";
const b64u = (b) => Buffer.from(b).toString("base64url");
const sha = (b) => crypto.createHash("sha256").update(b).digest();

// --- minimal CBOR kodlayici (yalniz gereken tipler) ---
function head(major, n) {
  if (n < 24) return Buffer.from([(major << 5) | n]);
  if (n < 256) return Buffer.from([(major << 5) | 24, n]);
  return Buffer.from([(major << 5) | 25, n >> 8, n & 255]);
}
function cbor(v) {
  if (Buffer.isBuffer(v)) return Buffer.concat([head(2, v.length), v]);
  if (typeof v === "string") { const b = Buffer.from(v); return Buffer.concat([head(3, b.length), b]); }
  if (typeof v === "number") return v >= 0 ? head(0, v) : head(1, -1 - v);
  if (v instanceof Map) return Buffer.concat([head(5, v.size), ...[...v].flatMap(([k, x]) => [cbor(k), cbor(x)])]);
  throw new Error("cbor tip");
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
const jwk = publicKey.export({ format: "jwk" });
const coseKey = cbor(new Map([[1, 2], [3, -7], [-1, 1], [-2, Buffer.from(jwk.x, "base64url")], [-3, Buffer.from(jwk.y, "base64url")]]));
const credId = crypto.randomBytes(32);
const rpHash = sha(RP_ID);

function counterBuf(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b; }

async function main() {
  // ---- KAYIT ----
  const reg = await generateRegistrationOptions({ rpName: "Karemux", rpID: RP_ID, userName: "t@karemux.com", userID: new TextEncoder().encode("personel-1"), attestationType: "none" });
  const clientData = Buffer.from(JSON.stringify({ type: "webauthn.create", challenge: reg.challenge, origin: ORIGIN, crossOrigin: false }));
  const attData = Buffer.concat([Buffer.alloc(16), Buffer.from([credId.length >> 8, credId.length & 255]), credId, coseKey]);
  const authData = Buffer.concat([rpHash, Buffer.from([0x45]), counterBuf(0), attData]); // UP | UV | AT
  const attObj = cbor(new Map([["fmt", "none"], ["attStmt", new Map()], ["authData", authData]]));
  const regResp = { id: b64u(credId), rawId: b64u(credId), type: "public-key", response: { clientDataJSON: b64u(clientData), attestationObject: b64u(attObj), transports: ["internal"] }, clientExtensionResults: {} };
  const rv = await verifyRegistrationResponse({ response: regResp, expectedChallenge: reg.challenge, expectedOrigin: [ORIGIN, "https://karemux.com"], expectedRPID: RP_ID });
  if (!rv.verified) throw new Error("kayit dogrulanmadi");
  const c = rv.registrationInfo.credential;
  if (c.id !== b64u(credId)) throw new Error("credential.id uyusmuyor");
  const saklananAnahtar = Buffer.from(c.publicKey).toString("base64url"); // sunucunun DB'ye yazdigi bicim
  console.log("kayit OK, credential.id uzunluk", c.id.length);

  // ---- GIRIS ----
  async function giris(sayac, { origin = ORIGIN, challengeDegis = false } = {}) {
    const opts = await generateAuthenticationOptions({ rpID: RP_ID, allowCredentials: [{ id: c.id }] });
    const cd = Buffer.from(JSON.stringify({ type: "webauthn.get", challenge: challengeDegis ? b64u(crypto.randomBytes(32)) : opts.challenge, origin, crossOrigin: false }));
    const ad = Buffer.concat([rpHash, Buffer.from([0x05]), counterBuf(sayac)]); // UP | UV
    const imza = crypto.sign("sha256", Buffer.concat([ad, sha(cd)]), privateKey);
    const resp = { id: c.id, rawId: c.id, type: "public-key", response: { clientDataJSON: b64u(cd), authenticatorData: b64u(ad), signature: b64u(imza) }, clientExtensionResults: {} };
    return verifyAuthenticationResponse({
      response: resp, expectedChallenge: opts.challenge, expectedOrigin: [ORIGIN, "https://karemux.com"], expectedRPID: RP_ID,
      credential: { id: c.id, publicKey: new Uint8Array(Buffer.from(saklananAnahtar, "base64url")), counter: sayac - 1 },
    });
  }
  const g1 = await giris(1);
  if (!g1.verified || g1.authenticationInfo.newCounter !== 1) throw new Error("giris 1 basarisiz");
  console.log("giris OK, newCounter", g1.authenticationInfo.newCounter);

  let reddedildi = 0;
  for (const [ad, secenek] of [["yanlis origin", { origin: "https://evil.example" }], ["yanlis challenge", { challengeDegis: true }]]) {
    try { await giris(2, secenek); console.log(`::error title=webauthn::${ad} KABUL EDILDI`); process.exit(1); } catch { reddedildi++; console.log(`${ad} reddedildi (beklenen)`); }
  }
  console.log("::notice title=webauthn test::TUM TESTLER GECTI (kayit, giris, sayac, " + reddedildi + " red)");
}
main().catch((e) => { console.log(`::error title=webauthn test::${String(e.message).slice(0, 300)}`); process.exit(1); });
