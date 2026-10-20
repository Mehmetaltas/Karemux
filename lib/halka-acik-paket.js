// Faz E - konu paketinin HERKESE ACIK (tarayiciya giden) bicimi. icerik_onbellek'teki tam paket
// cevap anahtarlarini (dogruIndex, aciklama, kontrolIfadesi) ve odev cozumlerini tasir; bunlar
// tarayiciya ASLA gitmez. Beyaz liste: yalnizca anlatim, gorsel, cevapsiz soru havuzu ve odev sorulari.
export function paketiHerkeseAc(paket) {
  let p = paket;
  if (typeof p === "string") { try { p = JSON.parse(p); } catch (e) { p = null; } }
  if (!p || typeof p !== "object") return null;
  const cikti = {};
  if (p.anlatim) cikti.anlatim = p.anlatim;
  if (p.gorselSvg) cikti.gorselSvg = p.gorselSvg;
  cikti.soruHavuzu = (Array.isArray(p.soruHavuzu) ? p.soruHavuzu : []).map((s) => ({
    soru: s?.soru, secenekler: s?.secenekler, zorluk: s?.zorluk || null, altKonu: s?.altKonu || null,
  }));
  cikti.odevSorulari = (Array.isArray(p.odevSorulari) ? p.odevSorulari : []).map((o) => ({ soru: o?.soru }));
  return cikti;
}
