import { sql } from "@/lib/db";
import { sifreHashle, tokenUret, oturumCookieBaslik } from "@/lib/auth";

// Veli onay token'iyla GERCEK bir veli hesabi acar (10-11 Eylul, kullanicinin
// bildirdigi gercek bosluk - once sadece onay isareti guncelleniyordu, veli
// hicbir zaman giris yapamiyordu). Ayni veli epostasi baska bir cocuk icin
// ONCEDEN hesap acmissa, YENI hesap acmiyoruz, sadece bu ogrenciyi mevcut
// veli hesabina baglayip onay veriyoruz.
export async function POST(req) {
  try {
    const { token, sifre } = await req.json();
    if (!token || !sifre || sifre.length < 6) {
      return Response.json({ error: "Sifre en az 6 karakter olmali." }, { status: 400 });
    }

    const ogrenciSonuc = await sql`SELECT id, ad, veli_eposta, veli_onay_verildi FROM kullanicilar WHERE veli_onay_token = ${token}`;
    if (ogrenciSonuc.length === 0) {
      return Response.json({ error: "Bu onay linki gecersiz veya suresi dolmus." }, { status: 404 });
    }
    if (ogrenciSonuc[0].veli_onay_verildi) {
      return Response.json({ error: "Bu hesap zaten onaylanmis." }, { status: 409 });
    }
    const { id: ogrenciId, ad: ogrenciAdi, veli_eposta: veliEposta } = ogrenciSonuc[0];

    // Ayni eposta ile ONCEDEN acilmis bir veli hesabi var mi kontrol et.
    const mevcutVeli = await sql`SELECT id FROM kullanicilar WHERE eposta = ${veliEposta} AND rol = 'veli'`;

    // 11 Eylul: eposta BASKA bir rolle (ogrenci/kurum) zaten kayitliysa, DB'nin
    // "eposta tekil" kurali INSERT'i sessizce patlatirdi - bunun yerine acik,
    // anlasilir bir hata donuyoruz. (Ayni epostanin birden fazla role
    // sahip olabilmesi ayri, daha buyuk bir mimari karar - simdilik desteklenmiyor.)
    if (mevcutVeli.length === 0) {
      const baskaRol = await sql`SELECT rol FROM kullanicilar WHERE eposta = ${veliEposta}`;
      if (baskaRol.length > 0) {
        return Response.json({ error: `Bu e-posta (${veliEposta}) zaten baska bir hesap turunde (${baskaRol[0].rol}) kayitli. Veli hesabi icin farkli bir e-posta kullanman gerekiyor - once ogrencinin profilinden veli e-postasini guncelleyip onay mailini tekrar gonder.` }, { status: 409 });
      }
    }
    let veliId;

    if (mevcutVeli.length > 0) {
      // Zaten hesabi var (baska bir cocuk icin acilmis) - yeni hesap acma,
      // sadece bu ogrenciyi bagla. Sifre burada degistirilmez (mevcut hesabin
      // sifresi kalir) - kullanici zaten bildigi sifreyle giris yapar.
      veliId = mevcutVeli[0].id;
    } else {
      const yeniSifreHash = await sifreHashle(sifre);
      const yeniVeli = await sql`
        INSERT INTO kullanicilar (eposta, sifre_hash, ad, rol)
        VALUES (${veliEposta}, ${yeniSifreHash}, ${"Veli"}, 'veli')
        RETURNING id
      `;
      veliId = yeniVeli[0].id;
    }

    await sql`
      INSERT INTO veli_ogrenci (veli_id, ogrenci_id)
      VALUES (${veliId}, ${ogrenciId})
      ON CONFLICT DO NOTHING
    `;
    await sql`UPDATE kullanicilar SET veli_onay_verildi = true, veli_onay_token = NULL WHERE id = ${ogrenciId}`;

    const oturumToken = tokenUret(veliId);
    return new Response(JSON.stringify({ ok: true, ogrenciAdi, girisYapildi: mevcutVeli.length === 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Set-Cookie": oturumCookieBaslik(oturumToken) },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Hesap olusturulamadi: " + e.message }, { status: 500 });
  }
}
