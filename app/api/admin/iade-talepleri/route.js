import { sql } from "@/lib/db";
import { denemeSiniriKontrolEt, denemeKaydet, istekIpAdresi } from "@/lib/guvenlik";
import { personelAdminMi } from "@/lib/personel";

async function yetkiKontrol(req, sifre) {
  const ip = istekIpAdresi(req);
  const kontrol = await denemeSiniriKontrolEt(ip, "iade_talep_admin", 5, 15);
  if (!kontrol.izinVar) return { izinVar: false, hata: "Cok fazla deneme. 15 dakika sonra tekrar dene." };
  if (sifre !== process.env.ULUSAL_DENEME_YONETICI_SIFRESI || !(await personelAdminMi(req))) {
    await denemeKaydet(ip, "iade_talep_admin", false);
    return { izinVar: false, hata: "Yetkisiz" };
  }
  await denemeKaydet(ip, "iade_talep_admin", true);
  return { izinVar: true };
}

export async function GET(req) {
  const sifre = new URL(req.url).searchParams.get("sifre");
  const yetki = await yetkiKontrol(req, sifre);
  if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });

  const talepler = await sql`
    SELECT it.id, it.odeme_id, it.paket, it.tutar_tl, it.sebep, it.durum, it.talep_tarihi, k.ad, k.eposta
    FROM iade_talepleri it
    LEFT JOIN kullanicilar k ON k.id = it.kullanici_id
    ORDER BY it.talep_tarihi DESC
  `;
  return Response.json({ talepler });
}

// 29 Eylul: Full Audit bulgusu - onaylama SADECE iade_talepleri.durum'u
// guncelliyordu; odeme kaydi, abonelik erisimi ve muhasebe HIC etkilenmiyordu
// (kullanici iade alip erisimi elinde tutabiliyordu, muhasebede iz kalmiyordu).
// Artik onaylaninca: odeme 'iade_edildi' isaretlenir, varsa AYNI plandaki aktif
// abonelik iptal edilir (erisim kesilir), ve giderler'e 'iade' kaydi eklenir -
// UCU UCUNA, tek PATCH icinde (yarim islemi onlemek icin transaction).
export async function PATCH(req) {
  try {
    const { sifre, id, durum, adminNotu } = await req.json();
    const yetki = await yetkiKontrol(req, sifre);
    if (!yetki.izinVar) return Response.json({ error: yetki.hata }, { status: 401 });
    if (!id || !["onaylandi", "reddedildi"].includes(durum)) return Response.json({ error: "Gecersiz istek" }, { status: 400 });

    const talep = await sql`SELECT id, kullanici_id, odeme_id, paket, tutar_tl, durum FROM iade_talepleri WHERE id = ${id}`;
    if (talep.length === 0) return Response.json({ error: "Talep bulunamadi" }, { status: 404 });
    if (talep[0].durum !== "beklemede") return Response.json({ error: "Bu talep zaten sonuclanmis" }, { status: 409 });

    // Not: @neondatabase/serverless'in HTTP istemcisi interaktif transaction
    // desteklemiyor (sql.transaction() SADECE onceden hazirlanmis, kosulsuz
    // bir dizi kabul ediyor) - bu proje genelinde de HICBIR yerde transaction
    // kullanilmiyor, ayni ardisik-sorgu desenine uyuluyor.
    await sql`UPDATE iade_talepleri SET durum = ${durum}, admin_notu = ${adminNotu || null}, sonuclanma_tarihi = now() WHERE id = ${id}`;

    if (durum === "onaylandi") {
      await sql`UPDATE odemeler SET durum = 'iade_edildi' WHERE id = ${talep[0].odeme_id}`;

      const aktifAbonelik = await sql`
        SELECT id FROM abonelikler
        WHERE kullanici_id = ${talep[0].kullanici_id} AND plan = ${talep[0].paket} AND durum = 'aktif'
        ORDER BY baslangic DESC LIMIT 1
      `;
      if (aktifAbonelik[0]) {
        await sql`UPDATE abonelikler SET durum = 'iptal', bitis = now() WHERE id = ${aktifAbonelik[0].id}`;
      }

      await sql`
        INSERT INTO giderler (kategori, tutar_tl, aciklama, tarih)
        VALUES ('iade', ${talep[0].tutar_tl}, ${`Iade - ${talep[0].paket} - talep #${id}`}, CURRENT_DATE)
      `;
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
