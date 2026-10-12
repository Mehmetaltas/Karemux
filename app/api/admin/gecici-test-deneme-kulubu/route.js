import { denemeKulubuUyeMi } from "@/lib/deneme-kulubu";

const GECICI_ANAHTAR = "karemux-gecici-12ekim-dalga9-denemekulubu-test";

export async function POST(req) {
  try {
    const { anahtar, kullaniciId } = await req.json();
    if (anahtar !== GECICI_ANAHTAR) return Response.json({ error: "yetkisiz" }, { status: 401 });

    const sonuc = await denemeKulubuUyeMi(kullaniciId);
    return Response.json({ kullaniciId, sonuc });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
