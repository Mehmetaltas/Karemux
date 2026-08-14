with open('app/page.js', encoding='utf-8') as f:
    content = f.read()

# 1) State ve fonksiyon ekleme - seviyeOnayTestiDegerlendir fonksiyonunun hemen sonrasina
marker1 = '''  function seviyeOnayTestiDegerlendir() {
    if (!seviyeOnayTest) return;
    const dogruSayisi = seviyeOnayTest.sorular.filter((s, i) => seviyeOnayCevaplar[i] === s.dogruIndex).length;
    const basariliMi = dogruSayisi >= 2;
    seviyeKademeIlerlet(seviyeOnayTest.kademeId, basariliMi);
  }'''

yeni1 = marker1 + '''

  const [seviyeKonuAcikId, setSeviyeKonuAcikId] = useState(null);
  const [seviyeKonuMetni, setSeviyeKonuMetni] = useState("");
  const [seviyeKonuYukleniyor, setSeviyeKonuYukleniyor] = useState(false);

  async function seviyeKonuAnlatimiGetir(u) {
    if (seviyeKonuAcikId === u.id) { setSeviyeKonuAcikId(null); return; } // tekrar tiklarsa kapansin
    setSeviyeKonuAcikId(u.id); setSeviyeKonuMetni(""); setSeviyeKonuYukleniyor(true); setHata("");
    try {
      const p = `Sen deneyimli bir "${u.ders}" ogretmenisin. "${u.unite}" konusunu, ${u.kaynak_sinif}. sinif seviyesinde bir ogrenciye, sade ve anlasilir bir dille anlat. Once kisa bir giris, sonra ana kavramlar (her biri icin tanim ve somut ornek), sonda 2 maddelik "dikkat edilecek noktalar". Toplam 300-400 kelime. SADECE duz metin yaz, markdown/LaTeX kullanma. SADECE Turkce yaz.`;
      const cevap = await aiIstek(p, 2500, cihazIdRef.current);
      setSeviyeKonuMetni(cevap);
    } catch (e) {
      setSeviyeKonuMetni("Konu anlatimi yuklenemedi, tekrar dene.");
    } finally {
      setSeviyeKonuYukleniyor(false);
    }
  }'''

if marker1 not in content:
    print("HATA: marker1 bulunamadi.")
else:
    content = content.replace(marker1, yeni1, 1)
    print("OK: Konu okuma fonksiyonu eklendi.")

# 2) Gorsel - "Okudum, Devam Et" butonunun USTUNE "Konuyu Simdi Oku" ve icerik alanini ekle
marker2 = '''                        {u.kademe === 1 && (
                          <>
                            <p style={{ fontSize: 10.5, color: COLORS.muted, marginBottom: 8 }}>Ders Calisma Odasi'ndan "{u.ders}" secip, {u.kaynak_sinif}. sinif konularindan "{u.unite}"yi incele.</p>
                            <button onClick={() => seviyeKademeIlerlet(u.id)} disabled={seviyeKademeIslemde === u.id} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: COLORS.ink, color: COLORS.page, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>
                              {seviyeKademeIslemde === u.id ? "..." : "Okudum, Devam Et"}
                            </button>
                          </>
                        )}'''

yeni2 = '''                        {u.kademe === 1 && (
                          <>
                            <button onClick={() => seviyeKonuAnlatimiGetir(u)} style={{ padding: "7px 14px", borderRadius: 7, border: `1.5px solid ${COLORS.coral}`, background: seviyeKonuAcikId === u.id ? COLORS.coral : "transparent", color: seviyeKonuAcikId === u.id ? "#fff" : COLORS.coral, fontWeight: 700, fontSize: 11.5, cursor: "pointer", marginBottom: 8 }}>
                              {seviyeKonuAcikId === u.id ? "Konuyu Kapat ▲" : "📖 Konuyu Simdi Oku"}
                            </button>
                            {seviyeKonuAcikId === u.id && (
                              <div style={{ background: "#FAF6EE", borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 11.5, lineHeight: 1.7, color: COLORS.ink, whiteSpace: "pre-wrap" }}>
                                {seviyeKonuYukleniyor ? "Hazirlaniyor..." : seviyeKonuMetni}
                              </div>
                            )}
                            <br />
                            <button onClick={() => seviyeKademeIlerlet(u.id)} disabled={seviyeKademeIslemde === u.id} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: COLORS.ink, color: COLORS.page, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>
                              {seviyeKademeIslemde === u.id ? "..." : "Okudum, Devam Et"}
                            </button>
                          </>
                        )}'''

if marker2 not in content:
    print("HATA: marker2 bulunamadi.")
else:
    content = content.replace(marker2, yeni2, 1)
    print("OK: Konu okuma gorseli eklendi.")

with open('app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)
