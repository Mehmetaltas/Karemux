// Soru kimliği: soru metni + seçenek kümesi (sıradan bağımsız) + görsel türü. Metin değişirse kimlik değişir (etiket de yeniden istenir).
const tohum = (str) => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
export function soruAnahtar(q) {
  const g = q[4] ? JSON.stringify(q[4]) : "";
  return tohum(q[0] + "|" + [...q[1]].sort().join("¦") + "|" + g);
}
