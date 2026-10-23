import { personelCoz } from "@/lib/personel";
import { passkeyleriGetir } from "@/lib/webauthn";

export async function GET(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ error: "Giriş gerekli" }, { status: 401 });
  const l = await passkeyleriGetir(personel.id);
  return Response.json({ passkeyler: l.map((p) => ({ id: p.id, ad: p.ad, olusturulma: p.olusturulma, sonKullanim: p.son_kullanim })) });
}
