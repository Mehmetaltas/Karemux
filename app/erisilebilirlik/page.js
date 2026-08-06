export const metadata = { title: "Erisilebilirlik — Karemux" };

export default function Erisilebilirlik() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "#1B2430" }}>
      <h1>Erisilebilirlik Beyani</h1>
      <p style={{ background: "#FFF1EF", padding: 12, borderRadius: 8, fontSize: 14 }}>
        <strong>Not:</strong> Bu metin bir baslangic seviyesi beyandir. Karemux, erisilebilirligi
        surekli iyilestirmeyi hedefler; eksik gordugunuz bir nokta varsa bize bildirin.
      </p>

      <h2>1. Taahhudumuz</h2>
      <p>Karemux, farkli yeteneklere sahip ogrencilerin de platformu kullanabilmesi icin
      calisir. Metin boyutlari, renk kontrasti ve klavye ile gezinme gibi konularda
      WCAG (Web Content Accessibility Guidelines) ilkelerini referans alir.</p>

      <h2>2. Su An Desteklenen Ozellikler</h2>
      <ul>
        <li>Yuksek kontrastli renk paleti</li>
        <li>Buyuk, okunakli dokunma alanlari (butonlar)</li>
        <li>Tarayicinin kendi yazi tipi buyutme ozelligiyle uyumlu tasarim</li>
      </ul>

      <h2>3. Gelistirme Asamasindaki Konular</h2>
      <p>Ekran okuyucu (screen reader) tam uyumlulugu ve klavye-only gezinme
      su an aktif olarak gelistirilmektedir.</p>

      <h2>4. Geri Bildirim</h2>
      <p>Erisilebilirlikle ilgili bir sorun yasarsaniz veya oneriniz varsa,
      info@karemux.com uzerinden bize ulasabilirsiniz.</p>

      <p style={{ marginTop: 30, fontSize: 13, color: "#6B7566" }}>Son guncelleme: Agustos 2026</p>
    </div>
  );
}
