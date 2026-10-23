import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { RP_ID, geciciPasskeyTokenCoz, passkeyleriGetir, challengeKaydet } from "@/lib/webauthn";

// Sifresi dogrulanmis personel (gecici belge ile) ikinci adim icin challenge ister.
export async function POST(req) {
  try {
    const { gecici } = await req.json();
    const personelId = geciciPasskeyTokenCoz(gecici);
    if (!personelId) return Response.json({ error: "Oturum süresi doldu, şifreyle tekrar gir" }, { status: 401 });
    const l = await passkeyleriGetir(personelId);
    if (l.length === 0) return Response.json({ error: "Passkey yok" }, { status: 400 });
    const opts = await generateAuthenticationOptions({
      rpID: RP_ID, userVerification: "preferred",
      allowCredentials: l.map((p) => ({ id: p.kimlik, transports: p.transports ? p.transports.split(",").filter(Boolean) : undefined })),
    });
    await challengeKaydet(personelId, "giris", opts.challenge);
    return Response.json(opts);
  } catch (e) {
    console.error("passkey giris-baslat:", e);
    return Response.json({ error: "Başlatılamadı" }, { status: 500 });
  }
}
