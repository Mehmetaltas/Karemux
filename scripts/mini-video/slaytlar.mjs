// Mini Ders (slayt + seslendirme) icin saf yardimcilar: konu paketi -> slayt listesi, sesli okuma metni, slayt HTML'i.
// Kural: icerik YALNIZ onayli/kalite kontrolu gecmis konu paketinden gelir; burada yeni bilgi uretilmez.

export function sesMetni(s) {
  return String(s || "")
    .replace(/\*\*|__|`|#/g, "")
    .replace(/(\d)\s*\^\s*(\d+)/g, "$1 üssü $2")
    .replace(/\^/g, " üssü ")
    .replace(/√\s*\(?(\d+)\)?/g, " karekök $1 ")
    .replace(/√/g, " karekök ")
    .replace(/[×·]|(?<=\d)\s*\*\s*(?=\d)/g, " çarpı ")
    .replace(/÷|(?<=\d)\s*\/\s*(?=\d)/g, " bölü ")
    .replace(/(?<=\s|\d)[−–](?=\s*\d)/g, " eksi ")
    .replace(/\+/g, " artı ")
    .replace(/=/g, " eşittir ")
    .replace(/%\s*(\d+)/g, "yüzde $1")
    .replace(/(\d+)\s*%/g, "yüzde $1")
    .replace(/\s+/g, " ")
    .trim();
}

function cumleleriBol(metin, enFazla = 240) {
  const cumleler = String(metin || "").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const parcalar = [];
  let mevcut = "";
  for (const c of cumleler.map((x) => x.trim()).filter(Boolean)) {
    if ((mevcut + " " + c).trim().length > enFazla && mevcut) { parcalar.push(mevcut); mevcut = c; }
    else mevcut = (mevcut + " " + c).trim();
  }
  if (mevcut) parcalar.push(mevcut);
  // Noktalamasiz cok uzun parca slayta sigmaz: kelime sinirindan zorla bol.
  return parcalar.flatMap((p) => {
    if (p.length <= enFazla * 1.4) return [p];
    const out = []; let cur = "";
    for (const k of p.split(" ")) { if ((cur + " " + k).trim().length > enFazla && cur) { out.push(cur); cur = k; } else cur = (cur + " " + k).trim(); }
    if (cur) out.push(cur);
    return out;
  });
}

// Ekranda gosterim: ^ ile yazilmis us, ust simge olarak; rakamlar arasi * carpi isareti.
const UST = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
export function ekranMetni(t) {
  return String(t ?? "")
    .replace(/\^(\(?-?\d+\)?)/g, (_, u) => u.replace(/[()]/g, "").split("").map((c) => UST[c] || c).join(""))
    .replace(/(?<=\d)\s*\*\s*(?=\d)/g, " × ");
}

const kelimeSayisi = (s) => String(s || "").split(/\s+/).filter(Boolean).length;

// baglam: { sinif, ders, unite, konu }
export function slaytlariOlustur(paket, baglam) {
  const a = paket?.anlatim;
  if (!a || typeof a !== "object") return { slaytlar: [], neden: "anlatim yok" };
  const toplam = kelimeSayisi([a.hizliOgren, a.temelAnlatim, a.derinAnlatim, a.yeniNesilUygulama].join(" "));
  if (toplam < 250) return { slaytlar: [], neden: `anlatim cok kisa (${toplam} kelime)` };

  const konu = baglam.konu || baglam.unite;
  const s = [];
  s.push({ tip: "kapak", baslik: konu, alt: `${baglam.sinif}. Sınıf · ${baglam.ders} · ${baglam.unite}`, ses: `Merhaba! Bu mini derste ${konu} konusunu birlikte öğreneceğiz. ${baglam.sinif}. sınıf ${baglam.ders} dersi, ${baglam.unite} ünitesi.` });
  // Resmi MEB kazanimlari (varsa; eslesme emin degilse bos gelir, uydurulmaz)
  const kaz = (baglam.kazanimlar || []).filter((k) => k && k.metin).slice(0, 3);
  if (kaz.length) s.push({ tip: "liste", baslik: "Bu Derste Neler Öğreneceksin?", maddeler: kaz.map((k) => `${k.metin} (${k.kod})`), ses: "Bu derste şunları öğreneceksin. " + kaz.map((k, i) => `${["Birincisi", "İkincisi", "Üçüncüsü"][i]}: ${k.metin}.`).join(" ") });
  if (a.hizliOgren) s.push({ tip: "metin", baslik: "Hızlı Özet", govde: a.hizliOgren, ses: a.hizliOgren });
  cumleleriBol(a.temelAnlatim).forEach((p, i, l) => s.push({ tip: "metin", baslik: l.length > 1 ? `Temel Anlatım (${i + 1}/${l.length})` : "Temel Anlatım", govde: p, ses: p }));
  // Konu paketi gorsel (kural-bazli SVG: ucgen, grafik, sayi dogrusu...) uretmisse kendi slaydinda gosterilir.
  const svg = typeof paket.gorselSvg === "string" ? paket.gorselSvg : paket.gorselSvg?.svg;
  if (typeof svg === "string" && /^\s*<svg[\s>]/i.test(svg) && svg.length < 20000) {
    s.push({ tip: "gorsel", baslik: "Şekle Bakalım", svg: svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, ""), ses: "Şimdi konuyu bir şekil üzerinden görelim. Ekrandaki şekle dikkatle bak." });
  }
  cumleleriBol(a.derinAnlatim).forEach((p, i, l) => s.push({ tip: "metin", baslik: l.length > 1 ? `Derinlemesine (${i + 1}/${l.length})` : "Derinlemesine", govde: p, ses: p }));
  const liste = (baslik, dizi, onsoz) => {
    const d = (dizi || []).map((x) => String(x || "").trim()).filter(Boolean);
    if (d.length) s.push({ tip: "liste", baslik, maddeler: d, ses: `${onsoz} ` + d.map((x, i) => `${["Birincisi", "İkincisi", "Üçüncüsü", "Dördüncüsü", "Beşincisi"][i] || "Ayrıca"}: ${x}`).join(" ") });
  };
  liste("Püf Noktaları", a.pufNoktalari, "Şimdi sınavda işine yarayacak püf noktalarına bakalım.");
  liste("Sık Yapılan Hatalar", a.sikHatalar, "Öğrencilerin en sık yaptığı hatalara dikkat edelim.");
  cumleleriBol(a.yeniNesilUygulama).forEach((p, i, l) => s.push({ tip: "metin", baslik: l.length > 1 ? `Yeni Nesil Uygulama (${i + 1}/${l.length})` : "Yeni Nesil Uygulama", govde: p, ses: p }));
  s.push({ tip: "kapanis", baslik: "Şimdi Sıra Sende!", alt: "Konu paketindeki soruları çöz, hatalarını tekrar et.", ses: `Mini dersimiz burada bitti. Şimdi sıra sende: konu paketindeki soruları çözerek öğrendiklerini pekiştir. Karemux ile başarılar!` });
  return { slaytlar: s.map((x) => ({ ...x, ses: sesMetni(x.ses) })), neden: null };
}

// Ogretmen senaryosu (Gemini, onayli konu paketinden) -> slayt listesi. Konusma ayri, ekranda yalniz kisa maddeler.
export function senaryodanSlaytlar(senaryo, paket, baglam) {
  const konu = baglam.konu || baglam.unite;
  const sl = (senaryo || []).filter((x) => x && x.baslik && x.konusma && String(x.konusma).length >= 80);
  if (sl.length < 6) return { slaytlar: [], neden: `senaryo yetersiz (${sl.length} slayt)` };
  const s = [{ tip: "kapak", baslik: konu, kunye: [[`${baglam.sinif}. Sınıf`, baglam.ders], ["Ünite", baglam.unite], ["Konu", konu]], ses: `Merhaba! Bugün ${konu} konusunu birlikte, adım adım öğreneceğiz. Hazırsan başlayalım.` }];
  const kaz = (baglam.kazanimlar || []).filter((k) => k && k.metin).slice(0, 4);
  if (kaz.length) s.push({ tip: "liste", baslik: "Bu Derste Öğreneceklerin", maddeler: kaz.map((k) => `${k.metin} (${k.kod})`), ses: "Önce bu derste neleri öğreneceğimize bir bakalım." });
  const svg = typeof paket?.gorselSvg === "string" ? paket.gorselSvg : paket?.gorselSvg?.svg;
  const svgVar = typeof svg === "string" && /^\s*<svg[\s>]/i.test(svg) && svg.length < 20000;
  sl.forEach((x, i) => {
    s.push({ tip: "madde", baslik: x.baslik, maddeler: (x.maddeler || []).filter(Boolean), ses: x.konusma });
    if (svgVar && i === Math.min(1, sl.length - 1)) {
      s.push({ tip: "gorsel", baslik: "Şekle Bakalım", svg: svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, ""), ses: "Şimdi konuyu bir şekil üzerinden görelim. Ekrandaki şekle dikkatle bak." });
    }
  });
  s.push({ tip: "kapanis", baslik: "Şimdi Sıra Sende!", alt: "Soruları çöz, öğrendiklerini pekiştir.", logo: true, ses: "Dersimiz burada bitti. Şimdi sıra sende: konuyla ilgili soruları çözerek öğrendiklerini pekiştir. Karemux ile başarılar!" });
  return { slaytlar: s.map((x) => ({ ...x, ses: sesMetni(x.ses) })), neden: null };
}

const esc = (t) => ekranMetni(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function slaytHtml(sl, sira, toplam, baglam) {
  const buyuk = sl.tip === "kapak" || sl.tip === "kapanis";
  const logo = baglam.logoUri && (sl.tip === "kapak" || sl.tip === "kapanis") ? `<img class="logo" src="${baglam.logoUri}" alt="">` : "";
  const kunye = sl.kunye ? `<table class="kunye">${sl.kunye.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</table>` : "";
  const govde = sl.tip === "gorsel"
    ? `<div class="kart">${sl.svg}</div>`
    : sl.tip === "madde"
    ? `<ul>${sl.maddeler.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>`
    : sl.tip === "liste"
    ? `<ol>${sl.maddeler.map((m) => `<li>${esc(m)}</li>`).join("")}</ol>`
    : sl.kunye ? kunye
    : sl.govde ? `<p class="g">${esc(sl.govde)}</p>` : sl.alt ? `<p class="alt">${esc(sl.alt)}</p>` : "";
  return `<!doctype html><html lang="tr"><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1280px;height:720px;background:#1F3D2E;color:#FFF8E8;font-family:"DejaVu Sans","Noto Sans",Arial,sans-serif;display:flex;flex-direction:column;padding:56px 72px;position:relative}
.ust{font-size:22px;color:#E8B339;letter-spacing:1px;font-weight:700;margin-bottom:26px}
h1{font-size:${buyuk ? 66 : 46}px;line-height:1.2;margin-bottom:30px;${buyuk ? "margin-top:40px;" : ""}color:#fff}
.g{font-size:34px;line-height:1.55}.alt{font-size:32px;color:#E8B339;line-height:1.5}
ul{font-size:36px;line-height:1.5;padding-left:44px}ul li::marker{color:#E8B339}ol{font-size:32px;line-height:1.5;padding-left:44px}li{margin-bottom:16px}
.kart{background:#fff;border-radius:18px;padding:20px;display:flex;justify-content:center;align-items:center;height:430px}.kart svg{max-width:100%;max-height:390px;width:auto;height:auto}
.alt-bar{position:absolute;left:72px;right:72px;bottom:34px;display:flex;justify-content:space-between;font-size:20px;color:#9FB8A8}
.logo{width:120px;height:120px;border-radius:26px;margin:36px 0 0 0}.kunye{font-size:34px;border-collapse:collapse}.kunye td{padding:8px 28px 8px 0;vertical-align:top}.kunye td:first-child{color:#E8B339;font-weight:700;white-space:nowrap}.cizgi{position:absolute;left:0;bottom:0;height:8px;background:#E8B339;width:${Math.round((sira / toplam) * 100)}%}
</style><body><div class="ust">KAREMUX · MİNİ DERS</div>${logo}<h1>${esc(sl.baslik)}</h1>${govde}
<div class="alt-bar"><span>${esc(baglam.ders)} · ${esc(baglam.sinif)}. Sınıf</span><span>${sira} / ${toplam}</span></div><div class="cizgi"></div></body></html>`;
}
