import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

// Admin, kendi kendine kaydolan (aktif=false) bir ogretmen hesabini
// onaylar (aktif=true yapar) ya da reddeder (kaydi siler).
export async function POST(req) {
  try {
    const { sifre, ogretmenId, karar } = await req.json();
    const ip = istekIpAdresi(req);
    const kontrol = await denemeSiniriKontrolEt(ip, "ogretmen_onay", 10, 15);
    if (!kontrol.izinVar) return Response.json({ error: "Cok fazla deneme." }, { status: 429 });
    if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
      await denemeKaydet(ip, "ogretmen_onay", false);
      return Response.json({ error: "Yetkisiz" }, { status: 401 });
    }
    await denemeKaydet(ip, "ogretmen_onay", true);

    if (!ogretmenId || !["onayla", "reddet"].includes(karar)) return Response.json({ error: "Eksik bilgi" }, { status: 400 });

    if (karar === "onayla") {
      await sql`UPDATE ogretmenler SET aktif = true WHERE id = ${ogretmenId}`;
    } else {
      await sql`DELETE FROM ogretmenler WHERE id = ${ogretmenId} AND aktif = false`;
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
