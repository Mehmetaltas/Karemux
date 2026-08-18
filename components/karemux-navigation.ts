export type KaremuxNavItem = {
  label: string;
  href?: string;
  icon?: string;
  children?: KaremuxNavItem[];
};

export const KAREMUX_NAVIGATION: KaremuxNavItem[] = [
  { label: "Ana Sayfa", href: "/", icon: "🏠" },
  {
    label: "Çalış",
    icon: "📚",
    children: [
      { label: "Ders Çalışma Odası", href: "/dersler" },
      { label: "Matematik", href: "/dersler/matematik" },
      { label: "Fen Bilimleri", href: "/dersler/fen" },
      { label: "Türkçe", href: "/dersler/turkce" },
      { label: "T.C. İnkılap Tarihi", href: "/dersler/inkilap" },
      { label: "Din Kültürü", href: "/dersler/din" },
      { label: "İngilizce", href: "/dersler/ingilizce" },
      { label: "Bugün Tekrar Zamanı", href: "/tekrar" },
      { label: "Zayıf Konularım", href: "/zayif-konular" },
    ],
  },
  {
    label: "Sınavlar",
    icon: "📝",
    children: [
      { label: "Deneme Sınavı", href: "/sinavlar/deneme" },
      { label: "Yazılı Hazırlığı", href: "/sinavlar/yazili" },
      { label: "Türkiye Geneli Deneme", href: "/sinavlar/turkiye-geneli" },
      { label: "Bursluluk Sınavı", href: "/sinavlar/iokbs" },
      { label: "Seviye Tespit", href: "/sinavlar/seviye-tespit" },
      { label: "Sınav Sonuçlarım", href: "/sinavlar/sonuclar" },
    ],
  },
  {
    label: "Hedef & Plan",
    icon: "🎯",
    children: [
      { label: "Hedef Okulum", href: "/hedef-okulum" },
      { label: "Haftalık Çalışma Planı", href: "/plan/haftalik" },
      { label: "Tatil Çalışma Programı", href: "/plan/tatil" },
      { label: "LGS Puan Hesaplayıcı", href: "/puan-hesaplayici" },
      { label: "Sınav Stratejisi", href: "/sinav-stratejisi" },
    ],
  },
  {
    label: "Çalışma Araçları",
    icon: "🧠",
    children: [
      { label: "Paragraf Stüdyosu", href: "/paragraf" },
      { label: "Formül ve Kural Kartları", href: "/kartlar/formul" },
      { label: "Kelime Kartları", href: "/kartlar/kelime" },
      { label: "Soru Çöz", href: "/soru-coz" },
      { label: "Sınav Kaygısı Desteği", href: "/sinav-kaygisi" },
    ],
  },
  {
    label: "Gelişimim",
    icon: "📊",
    children: [
      { label: "Karne ve Değerlendirme", href: "/karne" },
      { label: "Koç Paneli", href: "/koc" },
      { label: "Zayıf Konu Haritası", href: "/zayif-konular" },
      { label: "Başarılarım", href: "/basarilar" },
      { label: "Seviye Tamamlama", href: "/seviye" },
    ],
  },
  {
    label: "Bağlantılar",
    icon: "👥",
    children: [
      { label: "Veli Paneli", href: "/veli" },
      { label: "Öğretmenle Canlı Ders", href: "/canli-ders" },
      { label: "Kurum Paneli", href: "/kurum" },
    ],
  },
  { label: "KAREMUX Premium", href: "/premium", icon: "⭐" },
  {
    label: "Ayarlar",
    icon: "⚙️",
    children: [
      { label: "Profil", href: "/ayarlar/profil" },
      { label: "Tema", href: "/ayarlar/tema" },
      { label: "Bildirimler", href: "/ayarlar/bildirimler" },
      { label: "Gizlilik", href: "/gizlilik" },
      { label: "Kullanım Şartları", href: "/kullanim-sartlari" },
      { label: "Erişilebilirlik", href: "/erisilebilirlik" },
    ],
  },
];
