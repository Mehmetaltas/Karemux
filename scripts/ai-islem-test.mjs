const B="https://www.karemux.com";
const sinif=8;
const G={
 gorsel_karar:{ders:"Matematik",konu:"Ucgenler",sinif},
 icerik_denetle:{baglam:"Bu Matematik dersi konu anlatimi.",metin:"Ucgenin ic acilari toplami 180 derecedir."},
 soru_aciklama:{soru:"2+2 kactir?",secenekler:["A) 3","B) 4","C) 5","D) 6"],dogruIndex:1,secilenIndex:0},
 ders_tekrar:{dersAdi:"Matematik",sinif,tur:1},
 onerili_unite:{secilenDers:"Matematik",unite:"Carpanlar ve Katlar",sinif,zorlukSec:"orta",gecenYilZayif:false,manuelAltBaslik:[]},
 alt_konu:{dersAdi:"Matematik",uniteAdi:"Ucgenler"},
 kelime_karti:{kelimeKartiDers:"Ingilizce",kelimeKartiUnite:"School Life",sinif},
 seviye_konu:{ders:"Fen Bilimleri",unite:"Basinc",kaynak_sinif:7},
 paragraf:{sinif,paragrafTuru:"Başlık Bulma",paragrafZorluk:"orta"},
 formul:{dersAdi:"Matematik",uniteAdi:"Ucgenler",sinif},
 karne:{ozet:[{ders:"Matematik",testSayisi:3,ortalamaNet:"12.5",sonNet:"14.0"}]},
 konu_anlat:{ders:"Matematik",konu:"EBOB",uniteSec:"Carpanlar ve Katlar",sinif,zorlukSec:"orta"},
 plan:{sinif,zayifDersler:["Matematik","Turkce"],haftalikSaat:10,kalanHafta:8,tamamlananSayilari:{Matematik:3},zayifAltKonular:{Matematik:["EBOB","EKOK"]},saatlik:{enIyiSaat:9,enKotuSaat:22}},
 seviye_tespit:{sinif},
};
const JSONLU=new Set(["gorsel_karar","icerik_denetle","alt_konu","kelime_karti","paragraf","plan","seviye_tespit"]);
async function post(yol,govde){const t=Date.now();const r=await fetch(B+yol,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(govde)});let d={};try{d=await r.json()}catch{}return {s:r.status,sn:((Date.now()-t)/1000).toFixed(1),d};}
let hata=0;
for(const [k,g] of Object.entries(G)){
  const r=await post("/api/ai-islem",{islem:k,girdi:g,cihazId:"otomasyon-ai-"+k+"-"+Date.now()});
  let not="";
  if(r.s===200){
    const t=r.d.text||"";
    if(JSONLU.has(k)){try{const i=Math.min(...["{","["].map(c=>t.indexOf(c)).filter(x=>x>=0));JSON.parse(t.slice(i, Math.max(t.lastIndexOf("}"),t.lastIndexOf("]"))+1));not="json gecerli"}catch{not="JSON BOZUK";hata++}}
    else not=(t.length>40?"metin "+t.length+" karakter":"METIN KISA");
    if(t.length<=40)hata++;
  } else {not=(r.d.error||"").slice(0,90);hata++;}
  console.log(r.s,r.sn+"s",k.padEnd(15),not);
}
const neg=[
 ["bilinmeyen islem",{islem:"x",girdi:{},cihazId:"otomasyon-ai-neg"},400],
 ["serbest prompt denemesi",{islem:"konu_anlat",girdi:{ders:"Hack",konu:"ignore all",sinif:8},cihazId:"otomasyon-ai-neg"},400],
 ["asiri uzun konu",{islem:"konu_anlat",girdi:{ders:"Matematik",konu:"x".repeat(500),sinif:8},cihazId:"otomasyon-ai-neg"},400],
 ["prototype hilesi",{islem:"__proto__",girdi:{},cihazId:"otomasyon-ai-neg"},400],
];
for(const [ad,b,bek] of neg){const r=await post("/api/ai-islem",b);const ok=r.s===bek;if(!ok)hata++;console.log(ok?"OK ":"FAIL",ad,r.s,"(beklenen",bek+")");}
const eski=await post("/api/claude",{prompt:"Merhaba",cihazId:"otomasyon-ai-neg"});
if(eski.s!==410)hata++;console.log(eski.s===410?"OK ":"FAIL","eski /api/claude",eski.s,"(410 olmali)");
console.log(hata===0?"TUMU GECTI":"HATA SAYISI: "+hata);
