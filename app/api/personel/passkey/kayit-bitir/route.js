import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { sql } from "@/lib/db";
import { personelCoz } from "@/lib/personel";
import { RP_ID, IZINLI_ORIGINLER, challengeTuket, bytesToB64u } from "@/lib/webauthn";

export async function POST(req) {
  try {
    const personel = await personelCoz(req);
    if (!personel) return Response.json({ error: "Giriş gerekli" }, { status: 401 });
    const { yanit, ad } = await req.json();
    const challenge = await challengeTuket(personel.id, "kayit");
    if (!challenge) return Response.json({ error: "Süre doldu, tekrar dene" }, { status: 400 });

    const sonuc = await verifyRegistrationResponse({
      response: yanit, expectedChallenge: challenge, expectedOrigin: IZINLI_ORIGINLER, expectedRPID: RP_ID,
    });
    if (!sonuc.verified || !sonuc.registrationInfo) return Response.json({ error: "Doğrulanamadı" }, { status: 400 });
    const c = sonuc.registrationInfo.credential;
    await sql`
      INSERT INTO personel_passkey (personel_id, kimlik, genel_anahtar, sayac, transports, ad)
      VALUES (${personel.id}, ${c.id}, ${bytesToB64u(c.publicKey)}, ${c.counter || 0}, ${(c.transports || []).join(",")}, ${String(ad || "Cihazım").slice(0, 60)})
      ON CONFLICT (kimlik) DO NOTHING`;
    return Response.json({ ok: true });
  } catch (e) {
    console.error("passkey kayit-bitir:", e);
    return Response.json({ error: "Kaydedilemedi" }, { status: 400 });
  }
}
