with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

marker = '''        {mod === "bos" && !secilenDers && hesap && tekrarSayisi > 0 && (
          <button onClick={() => { setSecilenDers(null); setMod("tekrarzamani"); }} className="kx-fadein kx-btn" style={{ width: "100%", textAlign: "left", background: COLORS.ink, border: "none", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <span style={{ fontSize: 26 }}>🔁</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: COLORS.page }}>Bugün {tekrarSayisi} tekrar seni bekliyor</p>
              <p style={{ fontSize: 11, color: COLORS.page, opacity: 0.55 }}>Unutmadan pekiştirmek için hemen bak →</p>
            </div>
          </button>
        )}'''

yeni = marker + '''

        {mod === "bos" && !secilenDers && hesap && seviyeDurum && seviyeDurum.toplamZayif > seviyeDurum.tamamlanan && (
          <button onClick={() => { setSecilenDers(null); setMod("seviyetamamlama"); }} className="kx-fadein kx-btn" style={{ width: "100%", textAlign: "left", background: COLORS.coral, border: "none", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <span style={{ fontSize: 26 }}>🎯</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{seviyeDurum.toplamZayif - seviyeDurum.tamamlanan} konuda seviye eksigin var</p>
              <p style={{ fontSize: 11, color: "#fff", opacity: 0.85 }}>4-5. sinif temelini saglamlastir →</p>
            </div>
          </button>
        )}'''

if marker not in content:
    print("HATA: marker bulunamadi.")
else:
    content = content.replace(marker, yeni, 1)
    print("OK: Ana ekran uyari seridi eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
