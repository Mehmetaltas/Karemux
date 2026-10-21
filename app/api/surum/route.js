// Faz E - eski sekme (stale-tab) uyarisi: yayinda olan dagitim kimligini dondurur.
// Istemci acilista bu degeri hatirlar, sonra periyodik kontrol eder; deger degisirse "yeni surum var" uyarisi gosterir.
// Kimlik yoksa (yerel gelistirme) null doner; istemci bu durumda hicbir uyari gostermez.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { surum: process.env.VERCEL_DEPLOYMENT_ID || null },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
