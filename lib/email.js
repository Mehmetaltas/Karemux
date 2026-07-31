import { Resend } from "resend";

// Build sirasinda (Vercel "Collecting page data" asamasinda) modul yuklendigi
// anda API anahtari eksikse bazi SDK'lar hata firlatabiliyor. Bunu engellemek
// icin istemciyi sadece gercekten bir e-posta gonderilecegi anda olusturuyoruz.
export function resendIstemcisi() {
  return new Resend(process.env.RESEND_API_KEY);
}
