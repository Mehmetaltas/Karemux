import { personelCoz } from "@/lib/personel";

export async function GET(req) {
  const personel = await personelCoz(req);
  if (!personel) return Response.json({ girisYapmis: false });
  return Response.json({ girisYapmis: true, personel });
}
