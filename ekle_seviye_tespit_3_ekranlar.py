with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

marker = '        {mod === "ayarlar" && ('
yeni = '''        {mod === "seviyetespit" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>🎯</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Seviye Tespit Sinavi</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>4. ve 5. sinif konularindan karisik bir sinav - eksiklerini bulup tamamlamana yardimci olur.</p>
            </div>

            {!seviyeTestSorulari && !seviyeTestSonuc && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16, lineHeight: 1.6 }}>
                  Matematik, Turkce, Fen Bilimleri ve Sosyal Bilgiler'den 4. ve 5. sinif konularini kapsayan bir sinav.
                  Yanlis yaptigin konular icin otomatik bir tamamlama plani olusturulur.
                </p>
                <button className="kx-btn" onClick={seviyeTestiBaslat} disabled={seviyeTestYukleniyor}
                  style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                  {seviyeTestYukleniyor ? "Sinav hazirlaniyor..." : "Sinavi Baslat"}
                </button>
              </div>
            )}

            {seviyeTestSorulari && !seviyeTestSonuc && (
              <div>
                {seviyeTestSorulari.map((s, i) => (
                  <div key={i} style={{ background: COLORS.page, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 8 }}>
                    <p style={{ fontSize: 10, color: COLORS.muted, marginBottom: 4 }}>{s.ders} · {s.unite} ({s.sinif}. sinif)</p>
                    <p style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 8 }}>{i + 1}. {s.soru}</p>
                    {(s.secenekler || []).map((sec, j) => (
                      <button key={j} onClick={() => setSeviyeTestCevaplar((eski) => ({ ...eski, [i]: j }))} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "8px 10px", marginBottom: 5, borderRadius: 7, fontSize: 12.5, cursor: "pointer",
                        border: `1.5px solid ${seviyeTestCevaplar[i] === j ? COLORS.coral : COLORS.line}`, background: seviyeTestCevaplar[i] === j ? "#FFF1EF" : "#fff",
                      }}>{sec}</button>
                    ))}
                  </div>
                ))}
                <button className="kx-btn" onClick={seviyeTestiGonder} disabled={seviyeTestGonderiliyor || Object.keys(seviyeTestCevaplar).length < seviyeTestSorulari.length}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginTop: 8 }}>
                  {seviyeTestGonderiliyor ? "Gonderiliyor..." : `Sinavi Bitir (${Object.keys(seviyeTestCevaplar).length}/${seviyeTestSorulari.length})`}
                </button>
              </div>
            )}

            {seviyeTestSonuc && (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                <p style={{ fontSize: 30, marginBottom: 8 }}>✓</p>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{seviyeTestSonuc.dogruSayisi}/{seviyeTestSonuc.toplam} dogru</p>
                <p style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 16 }}>
                  {seviyeTestSonuc.zayifUniteSayisi > 0
                    ? `${seviyeTestSonuc.zayifUniteSayisi} konuda eksigin var - "Seviye Tamamlama" ekraninda bunlari kapatabilirsin.`
                    : "Tebrikler, hicbir eksigin cikmadi!"}
                </p>
                <button className="kx-btn" onClick={() => { setSecilenDers(null); setMod("seviyetamamlama"); }} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Seviye Tamamlamaya Git →
                </button>
              </div>
            )}
          </div>
        )}

        {mod === "seviyetamamlama" && (
          <div>
            <div className="kx-fadein" style={{ background: COLORS.gradient, borderRadius: 14, padding: "18px 18px", marginBottom: 14, textAlign: "center" }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>📶</p>
              <p style={{ color: COLORS.page, fontWeight: 700, fontSize: 16 }}>Seviye Tamamlama</p>
              <p style={{ color: "#B7C4BC", fontSize: 12, marginTop: 4 }}>Seviye tespit sinavinda zayif cikan konularin - 5. sinifla paralel tamamlanir.</p>
            </div>

            {!seviyeDurum ? (
              <p style={{ textAlign: "center", color: COLORS.muted, fontSize: 13 }}>Yukleniyor...</p>
            ) : !seviyeDurum.sinaviAldiMi ? (
              <div style={{ background: COLORS.page, borderRadius: 12, padding: 20, border: `1px solid ${COLORS.line}`, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14 }}>Once Seviye Tespit Sinavini almalisin.</p>
                <button className="kx-btn" onClick={() => { setSecilenDers(null); setMod("seviyetespit"); }} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Sinavi Al →
                </button>
              </div>
            ) : seviyeDurum.toplamZayif === 0 ? (
              <div style={{ background: "#EAF7EE", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <p style={{ fontSize: 30, marginBottom: 8 }}>🎉</p>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Tamamlanacak eksigin yok, harikasin!</p>
              </div>
            ) : (
              <div>
                <div style={{ background: COLORS.page, borderRadius: 10, padding: 12, marginBottom: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700 }}>{seviyeDurum.tamamlanan}/{seviyeDurum.toplamZayif} konu tamamlandi</p>
                </div>
                {seviyeDurum.uniteler.map((u) => (
                  <div key={u.id} style={{ background: u.tamamlandi ? "#EAF7EE" : COLORS.page, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.line}`, marginBottom: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 12.5 }}>{u.tamamlandi ? "✓ " : ""}{u.ders} — {u.unite} <span style={{ color: COLORS.muted, fontWeight: 500 }}>({u.kaynak_sinif}. sinif)</span></p>
                    {!u.tamamlandi && (
                      <>
                        <p style={{ fontSize: 10.5, color: COLORS.muted, margin: "4px 0 10px" }}>Kademe {u.kademe}/3 — {u.kademe === 1 ? "Konu anlatimini incele" : u.kademe === 2 ? "Pratik sorular coz" : "Onay testi ver"}</p>
                        {u.kademe === 1 && (
                          <>
                            <p style={{ fontSize: 10.5, color: COLORS.muted, marginBottom: 8 }}>Ders Calisma Odasi'ndan "{u.ders}" secip, {u.kaynak_sinif}. sinif konularindan "{u.unite}"yi incele.</p>
                            <button onClick={() => seviyeKademeIlerlet(u.id)} disabled={seviyeKademeIslemde === u.id} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: COLORS.ink, color: COLORS.page, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>
                              {seviyeKademeIslemde === u.id ? "..." : "Okudum, Devam Et"}
                            </button>
                          </>
                        )}
                        {u.kademe === 2 && (
                          <button onClick={() => seviyeKademeIlerlet(u.id)} disabled={seviyeKademeIslemde === u.id} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: COLORS.ink, color: COLORS.page, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>
                            {seviyeKademeIslemde === u.id ? "..." : "Pratik Yaptim, Devam Et"}
                          </button>
                        )}
                        {u.kademe === 3 && seviyeOnayAktifKademe !== u.id && (
                          <button onClick={() => seviyeOnayTestiBaslat(u)} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>
                            Onay Testini Baslat (3 Soru)
                          </button>
                        )}
                        {u.kademe === 3 && seviyeOnayAktifKademe === u.id && seviyeOnayTest && (
                          <div style={{ marginTop: 10 }}>
                            {seviyeOnayTest.sorular.map((s, i) => (
                              <div key={i} style={{ marginBottom: 10 }}>
                                <p style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 5 }}>{i + 1}. {s.soru}</p>
                                {(s.secenekler || []).map((sec, j) => (
                                  <button key={j} onClick={() => setSeviyeOnayCevaplar((eski) => ({ ...eski, [i]: j }))} style={{
                                    display: "block", width: "100%", textAlign: "left", padding: "6px 9px", marginBottom: 4, borderRadius: 6, fontSize: 11, cursor: "pointer",
                                    border: `1.5px solid ${seviyeOnayCevaplar[i] === j ? COLORS.coral : COLORS.line}`, background: seviyeOnayCevaplar[i] === j ? "#FFF1EF" : "#fff",
                                  }}>{sec}</button>
                                ))}
                              </div>
                            ))}
                            <button onClick={seviyeOnayTestiDegerlendir} disabled={Object.keys(seviyeOnayCevaplar).length < seviyeOnayTest.sorular.length}
                              style={{ width: "100%", padding: "8px 0", borderRadius: 7, border: "none", background: COLORS.coral, color: "#fff", fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>
                              Onay Testini Bitir
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mod === "ayarlar" && ('''

if marker not in content:
    print("HATA: marker bulunamadi.")
else:
    content = content.replace(marker, yeni, 1)
    print("OK: Seviye tespit ve tamamlama ekranlari eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
