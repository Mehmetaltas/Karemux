import { tokenDogrula } from "@/lib/auth";
import { getActiveAbonelik } from "@/lib/paket";

function cookieOku(req, ad) {
  const cookie = req.headers.get("cookie") || "";
  const eslesme = cookie.match(new RegExp(`${ad}=([^;]+)`));
  return eslesme ? eslesme[1] : null;
}

export async function GET(req) {
  try {
    const veri = tokenDogrula(cookieOku(req, "karemux_token"));
    if (!veri?.kullaniciId) return Response.json({ aktifAbonelik: null });

    const abonelik = await getActiveAbonelik(veri.kullaniciId);
    if (!abonelik) return Response.json({ aktifAbonelik: null });

    return Response.json({
      aktifAbonelik: {
        plan: abonelik.plan,
        baslangic: abonelik.baslangic,
        bitis: abonelik.bitis,
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ aktifAbonelik: null });
  }
}
