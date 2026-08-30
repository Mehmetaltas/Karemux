const { Client } = require("pg");
const { MUFREDAT, MUFREDAT_DIGER_SINIFLAR, DOGRULANMIS_ALT_KONULAR } = require("./mufredat-veri.js");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  let eklenen = 0, atlanilan = 0;

  for (const [ders, uniteler] of Object.entries(MUFREDAT)) {
    for (const unite of uniteler) {
      const anahtar = `${ders}::${unite}::8`;
      const altKonular = DOGRULANMIS_ALT_KONULAR[anahtar];
      if (altKonular && altKonular.length > 0) {
        for (const altKonu of altKonular) {
          await client.query(
            `INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi)
             VALUES (8, $1, $2, $3, 'eski_2018', 'resmi_pdf_dogrulu') ON CONFLICT DO NOTHING`,
            [ders, unite, altKonu]
          );
          eklenen++;
        }
      } else {
        await client.query(
          `INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi)
           VALUES (8, $1, $2, NULL, 'eski_2018', 'eksik_ai_tahmini') ON CONFLICT DO NOTHING`,
          [ders, unite]
        );
        atlanilan++;
      }
    }
  }

  for (const [anahtarKey, uniteler] of Object.entries(MUFREDAT_DIGER_SINIFLAR)) {
    const [sinifStr, ders] = anahtarKey.split("::");
    const sinif = Number(sinifStr);
    for (const unite of uniteler) {
      const anahtar = `${ders}::${unite}::${sinif}`;
      const altKonular = DOGRULANMIS_ALT_KONULAR[anahtar];
      if (altKonular && altKonular.length > 0) {
        for (const altKonu of altKonular) {
          await client.query(
            `INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi)
             VALUES ($1, $2, $3, $4, 'yeni_maarif_2024', 'resmi_pdf_dogrulu') ON CONFLICT DO NOTHING`,
            [sinif, ders, unite, altKonu]
          );
          eklenen++;
        }
      } else {
        await client.query(
          `INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi)
           VALUES ($1, $2, $3, NULL, 'yeni_maarif_2024', 'eksik_ai_tahmini') ON CONFLICT DO NOTHING`,
          [sinif, ders, unite]
        );
        atlanilan++;
      }
    }
  }

  console.log(`Tamamlandi: ${eklenen} dogrulanmis alt-konu kaydi, ${atlanilan} sadece-unite (eksik) kaydi eklendi.`);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
