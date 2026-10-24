import { planiTohumla, kaynakBosluklari } from "@/lib/video-plani";
const r = await planiTohumla();
console.log(`::notice title=plan::${r.toplam} alt konu satiri (yeni ${r.yeniSatir}), konu paketi hazir ${r.paketHazir}, paketi eksik ${r.toplam - r.paketHazir}`);
for (const b of kaynakBosluklari().filter((x) => x.konusuz_hafta || x.kazanim_eksik)) {
  console.log(`::warning title=kaynak boslugu::${b.sinif}. ${b.ders}: konusuz hafta ${b.konusuz_hafta} (gercek bosluk ${b.gercek_bosluk_hafta}; nedenler ${JSON.stringify(b.nedenler)}), kazanim ${b.kazanim_sayisi}${b.kazanim_eksik ? " EKSIK" : ""}`);
}
