import { NextResponse } from "next/server";

// 8-9 Eylul: ONCEDEN karemux.com'un koku ("/") tanitima yonlendiriliyordu,
// GERCEK uygulama sadece karemux-nu.vercel.app'te yasiyordu - kullanici
// panellere girince adres cubugunda "vercel.app" goruyordu. Artik TERSINE:
// www.karemux.com'un kendisi GERCEK uygulama, tanitim sayfasi kendi
// /tanitim adresinde ayrica duruyor (kaybolmadi, sadece varsayilan degil).
export function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
