export const metadata = { title: "Gizlilik Politikası — Karemux" };

export default function GizlilikPolitikasi() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "#1B2430" }}>
      <h1>Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <p style={{ background: "#FFF1EF", padding: 12, borderRadius: 8, fontSize: 14 }}>
        <strong>Not:</strong> Bu metin bir şablondur, hukuki danışmanlık yerine geçmez.
        Yayına almadan önce bir avukata veya KVKK danışmanına inceletmeniz önerilir.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>Karemux ("biz"), karemux.com üzerinden sunulan hizmet kapsamında işlenen
      kişisel verileriniz bakımından 6698 sayılı Kişisel Verilerin Korunması
      Kanunu (KVKK) uyarınca veri sorumlusudur.</p>

      <h2>2. Toplanan Veriler</h2>
      <ul>
        <li>Hesap bilgileri: ad, e-posta, şifre (hash'lenmiş hâliyle saklanır, düz metin olarak asla tutulmaz)</li>
        <li>Kullanım verisi: çözülen konular, quiz sonuçları, çalışma planı tercihleri</li>
        <li>Yüklenen görseller (soru fotoğrafları) — çözüm üretmek için yapay zekâ sağlayıcısına iletilir, kalıcı olarak saklanmaz</li>
        <li>Ödeme bilgileri: kart bilgileri bizde değil, iyzico'da (PCI-DSS uyumlu) saklanır</li>
      </ul>

      <h2>3. Reşit Olmayan Kullanıcılar</h2>
      <p>Hizmetimiz büyük ölçüde ortaokul/lise öğrencilerine yöneliktir. 18 yaşından
      küçük kullanıcıların hesap açması için veli/vasi bilgilendirilmeli ve mümkünse
      onay alınmalıdır. Veli görünümü özelliğimiz, velilerin öğrencinin ilerlemesini
      takip edebilmesi için tasarlanmıştır.</p>

      <h2>4. Verilerin Paylaşıldığı Üçüncü Taraflar</h2>
      <ul>
        <li><strong>Anthropic (Claude AI):</strong> Konu anlatımı, soru üretimi ve soru
        çözümü için gönderdiğiniz metin/görseller işlenmek üzere iletilir.</li>
        <li><strong>Neon (veritabanı):</strong> Hesap ve ilerleme verileri burada saklanır.</li>
        <li><strong>iyzico:</strong> Ödeme işlemleri için.</li>
        <li><strong>Resend:</strong> Sistem e-postaları (doğrulama kodu, abonelik uyarısı) göndermek için.</li>
      </ul>
      <p>Verileriniz pazarlama amacıyla üçüncü taraflara satılmaz.</p>

      <h2>5. Çerezler</h2>
      <p>Oturumunuzu açık tutmak için yalnızca zorunlu, teknik bir çerez (`karemux_token`)
      kullanılır. Bu çerez tarayıcı JavaScript'i ile okunamaz (httpOnly).</p>

      <h2>6. Haklarınız (KVKK Madde 11)</h2>
      <p>Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin
      bilgi talep etme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini
      isteme ve itiraz etme haklarına sahipsiniz. Talepleriniz için aşağıdaki
      iletişim adresini kullanabilirsiniz.</p>

      <h2>7. İletişim</h2>
      <p>[E-POSTA ADRESİNİZİ BURAYA EKLEYİN] üzerinden bize ulaşabilirsiniz.</p>

      <p style={{ marginTop: 30, fontSize: 13, color: "#6B7566" }}>Son güncelleme: [TARİH EKLEYİN]</p>
    </div>
  );
}
