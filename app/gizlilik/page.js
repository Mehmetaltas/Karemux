export const metadata = { title: "Gizlilik Politikası — Karemux" };

export default function GizlilikPolitikasi() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.7, color: "#1B2430" }}>
      <h1>Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
      <p style={{ background: "#FFF1EF", padding: 12, borderRadius: 8, fontSize: 14 }}>
        <strong>Not:</strong> Bu metin, KVKK ve genel gizlilik ilkelerine göre hazırlanmış
        kapsamlı bir taslaktır; hukuki danışmanlık yerine geçmez. Şirket resmileşme sürecinde
        bir avukat/KVKK danışmanı tarafından incelenip onaylanmadan nihai olarak kabul edilmemelidir.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>Karemux ("biz", "Şirket"), karemux.com ve bağlı uygulamalar üzerinden sunulan
      hizmet kapsamında işlenen kişisel verileriniz bakımından 6698 sayılı Kişisel
      Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusudur. Şirket unvanı ve
      iletişim bilgileri, ticari sicil kaydı tamamlandığında bu bölüme eklenecektir.</p>

      <h2>2. Toplanan Kişisel Veriler</h2>
      <ul>
        <li><strong>Kimlik ve iletişim:</strong> ad, e-posta adresi</li>
        <li><strong>Hesap güvenliği:</strong> şifre (yalnızca hash'lenmiş hâliyle saklanır, düz metin olarak asla tutulmaz), e-posta doğrulama kodu</li>
        <li><strong>Kullanım/öğrenme verisi:</strong> çözülen konular ve sorular, quiz/deneme/yazılı sonuçları, doğru-yanlış istatistikleri, hata kayıtları, çalışma planı tercihleri, günlük kullanım sayacı</li>
        <li><strong>Yapay zekâ etkileşimleri:</strong> yazdığınız sorular, yüklediğiniz soru fotoğrafları — yalnızca yanıt üretmek amacıyla ilgili yapay zekâ sağlayıcısına iletilir</li>
        <li><strong>Ödeme sürecine ait veriler:</strong> ödeme yapıldığında fatura adresi ve T.C. kimlik numarası iyzico'ya iletilir; kart bilgileri hiçbir aşamada bizim sunucularımıza ulaşmaz, doğrudan iyzico'nun PCI-DSS uyumlu altyapısında işlenir</li>
        <li><strong>Veli iletişim bilgisi:</strong> öğrenci kaydı sırasında alınan veli/ebeveyn e-posta adresi (bkz. Bölüm 4)</li>
      </ul>

      <h2>3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h2>
      <p>Verileriniz; hizmetin sunulabilmesi (sözleşmenin kurulması ve ifası), hesabınızın
      güvenliğinin sağlanması, ödeme işlemlerinin yürütülmesi, yasal yükümlülüklerin
      yerine getirilmesi ve hizmet kalitesinin ölçülüp iyileştirilmesi amaçlarıyla,
      KVKK'nın 5. maddesinde sayılan hukuki sebeplere dayanılarak işlenir. 18 yaşından
      küçük kullanıcılar için veri işlemenin hukuki sebebi, Bölüm 4'te açıklanan veli
      onayıdır.</p>

      <h2>4. Reşit Olmayan Kullanıcılar ve Veli Onayı</h2>
      <p>Hizmetimiz büyük ölçüde ortaokul öğrencilerine (5. sınıf – LGS) yöneliktir ve
      kullanıcılarımızın önemli bir kısmı 18 yaşından küçüktür. Bu konuda şeffaf olmak
      istiyoruz:</p>
      <ul>
        <li>Bir öğrenci hesabı oluşturulurken, bir veli/ebeveyn e-posta adresi
        <strong>zorunlu</strong> olarak alınır.</li>
        <li>Kayıt tamamlandığında, belirtilen veli e-posta adresine bir onay e-postası
        gönderilir. Veli/vasi, bu e-postadaki tek kullanımlık bağlantıya tıklayarak
        öğrencinin hesabını ve verilerinin işlenmesini onaylar.</li>
        <li>Veli onayı verilene kadar öğrencinin hesabında bu durumu belirten bir uyarı
        gösterilir; onay e-postası öğrencinin isteği üzerine tekrar gönderilebilir.</li>
        <li>Ayrıca öğrenciye özel bir "veli bağlantı kodu" üretilir; bir veli isterse bu
        kodu kendi hesabına girerek öğrencinin ilerleme verilerini de görüntüleyebilir —
        bu, yukarıdaki onay sürecinden ayrı, ek bir takip özelliğidir.</li>
        <li>Veli/vasi, çocuğuna ait hesabın verilerine erişim, düzeltme veya silme
        talebinde bulunmak isterse 7. bölümdeki iletişim kanalından bize ulaşabilir.</li>
      </ul>

      <h2>5. Kişisel Verilerin Aktarıldığı Üçüncü Taraflar</h2>
      <ul>
        <li><strong>Yapay zekâ sağlayıcıları (Anthropic ve gerektiğinde yedek sağlayıcılar):</strong> konu anlatımı, soru üretimi ve soru çözümü için gönderdiğiniz metin/görseller işlenmek üzere iletilir; bu sağlayıcılarda kalıcı olarak saklanmaz.</li>
        <li><strong>Neon (veritabanı barındırma):</strong> hesap ve öğrenme verileriniz burada saklanır.</li>
        <li><strong>Vercel (uygulama barındırma):</strong> uygulamanın çalıştığı sunucu altyapısı.</li>
        <li><strong>iyzico:</strong> ödeme işlemlerinin yürütülmesi için.</li>
        <li><strong>Resend:</strong> hesap doğrulama kodu, veli onay maili ve abonelik bildirimleri gibi sistem e-postalarının gönderimi için.</li>
        <li><strong>Telegram:</strong> etkinleştirilmişse, bildirim gönderimi için.</li>
      </ul>
      <p>Verileriniz hiçbir şekilde reklam/pazarlama amacıyla üçüncü taraflara satılmaz
      veya kiralanmaz.</p>

      <h2>6. Verilerin Saklanma Süresi</h2>
      <p>Kişisel verileriniz, hesabınız aktif olduğu sürece ve yukarıdaki amaçların
      gerektirdiği süre boyunca saklanır. Hesap silme talebinde bulunmanız hâlinde,
      yasal saklama yükümlülüklerimiz (örn. ödeme kayıtları için muhasebe mevzuatı)
      dışındaki veriler makul bir süre içinde silinir veya anonimleştirilir.</p>

      <h2>7. Veri Güvenliği</h2>
      <p>Şifreleriniz geri döndürülemez şekilde hash'lenerek saklanır. Oturum
      bilgileriniz, tarayıcı JavaScript'i tarafından okunamayan (httpOnly) bir çerezde
      tutulur. Veritabanı bağlantıları ve API anahtarları yalnızca sunucu tarafında
      bulunur, istemciye (tarayıcıya) hiçbir zaman gönderilmez. Veli onay bağlantıları
      tek kullanımlıktır ve onaylandıktan sonra geçersiz hâle gelir.</p>

      <h2>8. Çerezler</h2>
      <p>Oturumunuzu açık tutmak için yalnızca zorunlu, teknik bir çerez (`karemux_token`)
      kullanılır. Reklam veya izleme amaçlı üçüncü taraf çerezleri kullanılmamaktadır.</p>

      <h2>9. Haklarınız (KVKK Madde 11)</h2>
      <p>KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini
      öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına
      uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında verilerin
      aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme,
      KVKK'da öngörülen şartlarda silinmesini/yok edilmesini isteme, düzeltme/silme
      işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme, işlenen verilerin
      münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun
      ortaya çıkmasına itiraz etme ve kanuna aykırı işlenme nedeniyle zarara uğramanız
      hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.</p>

      <h2>10. Başvuru Usulü</h2>
      <p>Yukarıdaki haklarınızı kullanmak için taleplerinizi 7. bölümdeki e-posta
      adresine, kimliğinizi doğrulayacak bilgilerle birlikte yazılı olarak iletebilirsiniz.
      Talebiniz, niteliğine göre en kısa sürede ve en geç 30 gün içinde sonuçlandırılır.</p>

      <h2>11. Politika Değişiklikleri</h2>
      <p>İşbu politika, yasal düzenlemeler veya hizmetlerimizdeki değişiklikler
      doğrultusunda güncellenebilir. Güncel sürüm her zaman bu sayfada yayınlanır.</p>

      <h2>12. İletişim</h2>
      <p>Gizlilik politikamıza ilişkin sorularınız ve KVKK başvurularınız için
      info@karemux.com üzerinden bize ulaşabilirsiniz.</p>

      <p style={{ marginTop: 30, fontSize: 13, color: "#6B7566" }}>Son güncelleme: 15 Ağustos 2026</p>
    </div>
  );
}
