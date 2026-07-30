// Neon Postgres bağlantısı. Vercel'de DATABASE_URL ortam değişkenini
// Neon panelinden aldığınız "connection string" ile doldurun.
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.warn("UYARI: DATABASE_URL tanımlı değil - veritabanı sorguları çalışmayacak.");
}

export const sql = neon(process.env.DATABASE_URL || "");
