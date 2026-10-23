// Slayt listesi + ses saglayici -> mp4. Saglayicilar enjekte edilir (gercek: edge-tts; test: sessiz).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { slaytHtml } from "./slaytlar.mjs";

async function playwrightYukle() {
  try { return await import("playwright"); } catch { const yedek = "/opt/npm-tools/node_modules/playwright/index.mjs"; return await import(/* @vite-ignore */ yedek); }
}
const sureOku = (dosya) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dosya]).toString().trim());

// tts(metin, hedefMp3Yolu) -> Promise<void>
export async function mp4Uret({ slaytlar, baglam, tts, dizin, cikti }) {
  fs.mkdirSync(dizin, { recursive: true });
  const { chromium } = await playwrightYukle();
  const tarayici = await chromium.launch({ args: ["--no-sandbox"] });
  const sayfa = await tarayici.newPage({ viewport: { width: 1280, height: 720 } });
  const parcalar = [];
  try {
    for (let i = 0; i < slaytlar.length; i++) {
      const png = path.join(dizin, `s${i}.png`), ses = path.join(dizin, `s${i}.mp3`), mp4 = path.join(dizin, `s${i}.mp4`);
      await sayfa.setContent(slaytHtml(slaytlar[i], i + 1, slaytlar.length, baglam));
      await sayfa.screenshot({ path: png });
      await tts(slaytlar[i].ses, ses);
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-loop", "1", "-framerate", "5", "-i", png, "-i", ses,
        "-af", "apad=pad_dur=0.7", "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2", "-shortest", mp4]);
      parcalar.push(mp4);
    }
  } finally { await tarayici.close(); }
  const liste = path.join(dizin, "liste.txt");
  fs.writeFileSync(liste, parcalar.map((p) => `file '${path.resolve(p)}'`).join("\n"));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", liste, "-c", "copy", "-movflags", "+faststart", cikti]);
  return { sureSn: Math.round(sureOku(cikti)), slaytSayisi: slaytlar.length };
}
