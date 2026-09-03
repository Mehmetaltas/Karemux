// app/page.js'teki TEMALAR sabitinin ayni kopyasi (1 Eylul deseniyle ayni:
// ana ogrenci app'i degistirilmeden, digerlerinin de ayni paylasilan
// veriden beslenmesi icin). Ikisi senkron olmali, biri guncellenirse digeri de.
export const TEMALAR = {
  minimal: {
    isim: "Minimal", ikon: "⚪",
    bg: "#F5F5F7", page: "#FFFFFF", ink: "#1D1D1F", muted: "#86868B",
    coral: "#0A84FF", mustard: "#FF9F0A", line: "#E5E5EA",
    gradient: "linear-gradient(160deg, #1D1D1F 0%, #000000 100%)", bgText: "#1D1D1F",
  },
  orman: {
    isim: "Orman", ikon: "🌲",
    bg: "#1F3D2E", page: "#FAF6EE", ink: "#1B2430", muted: "#6B7566",
    coral: "#FF6B5E", mustard: "#E8B339", line: "#DCD5C4",
    gradient: "linear-gradient(160deg, #24402F 0%, #1A2E22 100%)", bgText: "#FAF6EE",
  },
  galaktik: {
    isim: "Galaktik", ikon: "🌌",
    bg: "#0D0B1F", page: "#F4F2FF", ink: "#1A1730", muted: "#8A7FC7",
    coral: "#FF5CA8", mustard: "#7C4DFF", line: "#3A3268",
    gradient: "linear-gradient(160deg, #241B4A 0%, #0D0B1F 100%)", bgText: "#F4F2FF",
  },
  hologram: {
    isim: "Hologram", ikon: "💠",
    bg: "#071A22", page: "#EAFBFF", ink: "#062830", muted: "#4FB8C9",
    coral: "#00E5C7", mustard: "#00B8FF", line: "#0F3A44",
    gradient: "linear-gradient(160deg, #0D3A44 0%, #071A22 100%)", bgText: "#EAFBFF",
  },
  uzay: {
    isim: "Uzay", ikon: "🪐",
    bg: "#14121F", page: "#FDF6EC", ink: "#221D33", muted: "#9C8FB5",
    coral: "#FF9A3C", mustard: "#FFD166", line: "#3A3352",
    gradient: "linear-gradient(160deg, #241F3D 0%, #14121F 100%)", bgText: "#FDF6EC",
  },
};

export function temaOku(varsayilan = "orman") {
  if (typeof window === "undefined") return varsayilan;
  try {
    const kayitli = localStorage.getItem("karemux_tema");
    return kayitli && TEMALAR[kayitli] ? kayitli : varsayilan;
  } catch { return varsayilan; }
}

export function temaKaydet(tema) {
  try { localStorage.setItem("karemux_tema", tema); } catch {}
}
