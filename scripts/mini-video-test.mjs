// Yerel/CI dogrulama: ornek konu paketinden mini ders mp4'u uretir (ses = kelime sayisina gore sessiz iz), cikti dosyasini dogrular.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { slaytlariOlustur, sesMetni } from "./mini-video/slaytlar.mjs";
import { mp4Uret } from "./mini-video/uret.mjs";

const w = (n) => Array.from({ length: n }, (_, i) => `kelime${i}`).join(" ");
const paket = { anlatim: {
  hizliOgren: "Üslü ifade, bir sayının kendisiyle tekrarlı çarpımıdır. 2^3 = 8 olur.",
  temelAnlatim: "Bak, önce şuna bakalım. 2^3 ifadesinde 2 tabandır, 3 ise üstür. Yani 2 × 2 × 2 işlemi yapılır. " + w(110) + ". Sonuç 8 çıkar.",
  derinAnlatim: "Neden böyle? Çünkü üs, çarpmanın kısaltmasıdır. " + w(130) + ". Negatif tabanda işaret üs çift ise pozitif olur.",
  pufNoktalari: ["Taban aynıysa üsler toplanır.", "Üssün üssü çarpılır.", "Sıfırıncı kuvvet 1'dir."],
  sikHatalar: ["(-2)^2 ile -2^2 aynı sanılır.", "Tabanlar toplanır sanılır.", "Üs ile çarpan karıştırılır."],
  yeniNesilUygulama: "Bir bakteri her saat ikiye bölünüyor. " + w(60) + ". 3 saat sonra 2^3 = 8 bakteri olur.",
} };
const { slaytlar, neden } = slaytlariOlustur(paket, { sinif: 8, ders: "Matematik", unite: "Üslü İfadeler", konu: "Üslü İfadeler" });
if (neden || slaytlar.length < 8) { console.log(`::error title=mini video::slayt uretimi basarisiz: ${neden} (${slaytlar.length})`); process.exit(1); }

// sesMetni kontrolleri
const beklenen = [["2^3 = 8", "2 üssü 3 eşittir 8"], ["2 × 2", "2 çarpı 2"], ["%25", "yüzde 25"]];
for (const [g, b] of beklenen) { const r = sesMetni(g); if (!r.includes(b)) { console.log(`::error title=mini video::sesMetni('${g}')='${r}' beklenen '${b}'`); process.exit(1); } }

const dizin = "/tmp/mini-video-test"; fs.rmSync(dizin, { recursive: true, force: true });
// sessiz ses: ~ kelime basina 0.4 sn
const tts = async (metin, hedef) => {
  const sn = Math.max(1.5, metin.split(/\s+/).length * 0.4);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(sn), "-c:a", "libmp3lame", hedef]);
};
const cikti = `${dizin}/mini.mp4`;
const r = await mp4Uret({ slaytlar, baglam: { sinif: 8, ders: "Matematik" }, tts, dizin, cikti });
const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", cikti]).toString());
const v = info.streams.find((s) => s.codec_type === "video"), a = info.streams.find((s) => s.codec_type === "audio");
const ok = v && a && v.width === 1280 && v.height === 720 && Number(info.format.duration) > 30 && fs.statSync(cikti).size > 20000;
console.log(JSON.stringify({ slayt: r.slaytSayisi, sureSn: r.sureSn, video: v && `${v.codec_name} ${v.width}x${v.height}`, ses: a && a.codec_name, boyutKB: Math.round(fs.statSync(cikti).size / 1024) }));
if (!ok) { console.log("::error title=mini video::cikti dogrulanamadi"); process.exit(1); }
console.log("::notice title=mini video test::GECTI");
