// Admin panelinin sekme/menu gruplari (16 Eylul) - app/admin/page.js'in
// ICINDE tanimli olan SEKME_GRUPLARI buraya cikarildi. Davranis AYNEN
// korunuyor, sadece bakim/degisiklik riskini azaltmak icin ayri dosyaya
// tasindi (ogrenci menusunde de ayni desen uygulandi, 16 Eylul).

export const SEKME_GRUPLARI = [
  { baslik: null, sekmeler: [["genel", "📊 Genel Bakış"]] },
  { baslik: "💰 Finans", sekmeler: [
    ["paketler", "💰 Paketler"], ["giderler", "🧾 Giderler"], ["cari", "🤝 Cari"], ["kasa", "🏦 Kasa/Banka"],
    ["maliyet", "🤖 Üretim Maliyeti"], ["simulasyon", "🧮 Simülasyon"], ["planlama", "📈 Finansal Planlama"],
    ["indirimkodlari", "🏷️ İndirim Kodları"], ["iadeler", "🛡️ İade Talepleri"], ["havaleler", "🏦 Havale Onayları"], ["impersonate", "👤 Kullanıcı Görüntüle"], ["donusumhuni", "📊 Satış Hunisi"], ["destek", "🎧 Destek"],
  ]},
  { baslik: "🎓 Eğitim", sekmeler: [["mufredat", "📚 Müfredat"], ["ogretmen", "🎓 Öğretmenler"]] },
  { baslik: "🎥 Canlı Hizmetler", sekmeler: [["canliders", "🎥 Canlı Ders"], ["randevuodeme", "📅 Randevu Ödemeleri"], ["kurumlar", "🏢 Kurumlar"]] },
  { baslik: "👥 İnsan Kaynakları", sekmeler: [["ik", "🗂️ Personel Yönetimi"], ["kariyer", "🧑‍💼 Kariyer Havuzu"]] },
  { baslik: "📢 İletişim", sekmeler: [["duyuru", "📢 Duyuru"], ["talepler", "💡 Kullanıcı Talepleri"]] },
  { baslik: "⚙️ Sistem", sekmeler: [["butunluk", "🧭 Sistem Bütünlüğü"], ["ikiz", "🐋 Sistem İkizi"], ["tema", "🎨 Tema"], ["hesabim", "👤 Hesabım"]] },
];
