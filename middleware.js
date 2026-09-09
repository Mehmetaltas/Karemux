import { NextResponse } from "next/server";

// 8-9 Eylul: Ana adres (www.karemux.com) - giris yapmis KULLANICIYA (karemux_token)
// veya daha once uygulamayi kullanmis (karemux_gorundu, anonim/cihaz kullanicilar
// dahil, sessizce/otomatik set edilir) HERKESE gercek uygulamayi gosterir. Hic
// gormemis TAMAMEN YENI ziyaretciye tanitim gosterilir. Tanitimdaki "Basla"
// linkleri ?uygulama=1 ile bu kontrolu bir kere atlar, sonra cihaz kendi
// cerezini biraktigi icin bir dahaki ziyarette dogal olarak uygulamaya duser.
export function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;
  if (pathname !== "/") return NextResponse.next();

  const gercekGiris = req.cookies.get("karemux_token");
  const dahaOnceGorulmus = req.cookies.get("karemux_gorundu");
  const zorlaUygulama = searchParams.get("uygulama") === "1";

  if (gercekGiris || dahaOnceGorulmus || zorlaUygulama) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/tanitim";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: "/",
};
