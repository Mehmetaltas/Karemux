import { cikisCookieBaslik } from "@/lib/auth";

export async function POST(req) {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": cikisCookieBaslik(req) },
  });
}
