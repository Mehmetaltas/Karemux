import { tokenUret } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req) {
  const url = new URL(req.url);
  const kid = Number(url.searchParams.get("kid"));
  const token = tokenUret(kid);
  return Response.json({ token });
}
