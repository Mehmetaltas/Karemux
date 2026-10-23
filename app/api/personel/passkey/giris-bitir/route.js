import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { sql } from "@/lib/db";
import { personelTokenUret, personelOturumCookieBaslik } from "@/lib/personel";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { RP_ID, IZINLI_ORIGINLER, geciciPasskeyTokenCoz, passkeyleriGetir, challengeTuket, b64uToBytes } from "@/lib/webauthn";

export async function POST(req) {
  try {
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "personel_passkey", 6, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Çok fazla deneme. 15 dakika sonra tekrar dene." }, { status: 429 });

    const { gecici, yanit, beniHatirla } = await req.json();
    const personelId = geciciPasskeyTokenCoz(gecici);
    if (!personelId) return Response.json({ error: "Oturum süresi doldu, şifreyle tekrar gir" }, { status: 401 });
    const challenge = await challengeTuket(personelId, "giris");
    if (!challenge) return Response.json({ error: "Süre doldu, tekrar dene" }, { status: 400 });

    const kayitlar = await passkeyleriGetir(personelId);
    const k = kayitlar.find((p) => p.kimlik === yanit?.id);
    if (!k) { await denemeKaydet(ip, "personel_passkey", false); return Response.json({ error: "Tanınmayan anahtar" }, { status: 401 }); }

    const sonuc = await verifyAuthenticationResponse({
      response: yanit, expectedChallenge: challenge, expectedOrigin: IZINLI_ORIGINLER, expectedRPID: RP_ID,
      credential: { id: k.kimlik, publicKey: b64uToBytes(k.genel_anahtar), counter: Number(k.sayac), transports: k.transports ? k.transports.split(",").filter(Boolean) : undefined },
    });
    if (!sonuc.verified) { await denemeKaydet(ip, "personel_passkey", false); return Response.json({ error: "Doğrulanamadı" }, { status: 401 }); }
    await denemeKaydet(ip, "personel_passkey", true);

    await sql`UPDATE personel_passkey SET sayac = ${sonuc.authenticationInfo.newCounter}, son_kullanim = now() WHERE id = ${k.id}`;
    const p = await sql`SELECT id, ad, rol FROM personel WHERE id = ${personelId} AND aktif = true`;
    if (!p[0]) return Response.json({ error: "Hesap pasif" }, { status: 403 });
    await sql`UPDATE personel SET son_giris = now() WHERE id = ${personelId}`;
    const token = personelTokenUret(personelId);
    // KOPRU: /api/personel/giris ile ayni govde (paylasilan admin sifresi istemciye yalniz kimlik dogrulaninca doner).
    return new Response(JSON.stringify({ ok: true, ad: p[0].ad, rol: p[0].rol, sifre: process.env.ULUSAL_DENEME_YONETICI_SIFRESI }), {
      status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": personelOturumCookieBaslik(token, beniHatirla !== false) },
    });
  } catch (e) {
    console.error("passkey giris-bitir:", e);
    return Response.json({ error: "Doğrulanamadı" }, { status: 401 });
  }
}
