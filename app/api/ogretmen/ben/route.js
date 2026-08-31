import { ogretmenCoz } from "@/lib/ogretmen";

export async function GET(req) {
  const ogretmen = await ogretmenCoz(req);
  if (!ogretmen) return Response.json({ error: "Oturum yok" }, { status: 401 });
  return Response.json({ ogretmen });
}
