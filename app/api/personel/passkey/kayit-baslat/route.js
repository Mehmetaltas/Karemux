import { generateRegistrationOptions } from "@simplewebauthn/server";
import { personelCoz } from "@/lib/personel";
import { RP_ADI, RP_ID, passkeyleriGetir, challengeKaydet } from "@/lib/webauthn";

// Giris yapmis personel yeni passkey kaydetmeye baslar.
export async function POST(req) {
  try {
    const personel = await personelCoz(req);
    if (!personel) return Response.json({ error: "Giriş gerekli" }, { status: 401 });
    const mevcut = await passkeyleriGetir(personel.id);
    const opts = await generateRegistrationOptions({
      rpName: RP_ADI, rpID: RP_ID,
      userName: personel.eposta, userDisplayName: personel.ad || personel.eposta,
      userID: new TextEncoder().encode(`personel-${personel.id}`),
      attestationType: "none",
      excludeCredentials: mevcut.map((p) => ({ id: p.kimlik })),
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    });
    await challengeKaydet(personel.id, "kayit", opts.challenge);
    return Response.json(opts);
  } catch (e) {
    console.error("passkey kayit-baslat:", e);
    return Response.json({ error: "Başlatılamadı" }, { status: 500 });
  }
}
