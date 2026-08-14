import { NextResponse } from "next/server";

// karemux.com (ve www.karemux.com) uzerinden gelen ziyaretciler icin ana
// sayfayi ("/") gorunmez sekilde /tanitim'e yonlendiriyoruz - URL adres
// cubugunda degismiyor, sadece o icerik sunuluyor. karemux-nu.vercel.app
// (gercek calisan sistem) bundan ETKILENMEZ, orada "/" hep gercek uygulama.
export function middleware(req) {
  const host = req.headers.get("host") || "";
  const gercekDomain = host === "karemux.com" || host === "www.karemux.com";

  if (gercekDomain && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/tanitim";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
