DELETE FROM mufredat WHERE ders='Matematik' AND sinif=5 AND unite IN ('Geometrik Nicelikler','Istatistiksel Arastirma Sureci');

INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi) VALUES
(5,'Matematik','Geometrik Nicelikler','Dikdortgenin Cevre Uzunlugu ve Alani','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(5,'Matematik','Istatistiksel Arastirma Sureci','Kategorik Veri Dagilimlari','yeni_maarif_2024','resmi_yillik_plan_2026_2027');

DELETE FROM mufredat WHERE ders='Matematik' AND sinif=6 AND unite='Geometrik Nicelikler';

INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi) VALUES
(6,'Matematik','Geometrik Nicelikler','Uzunluk ve Alan Olcme Birimleri Arasindaki Iliski','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(6,'Matematik','Geometrik Nicelikler','Paralelkenar ve Ucgenin Alani','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(6,'Matematik','Geometrik Nicelikler','Cemberin ve Capin Uzunluklari Arasindaki Iliski','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(6,'Matematik','Geometrik Nicelikler','Cemberde Merkez Aci ve Gordugu Yay Uzunlugu','yeni_maarif_2024','resmi_yillik_plan_2026_2027');

DELETE FROM mufredat WHERE ders='Fen Bilimleri' AND sinif=8 AND unite='DNA ve Genetik Kod';

INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi) VALUES
(8,'Fen Bilimleri','DNA ve Genetik Kod','DNA ve Genetik Kod Yapisi','eski_2018','resmi_yillik_plan_2026_2027'),
(8,'Fen Bilimleri','DNA ve Genetik Kod','Kalitim','eski_2018','resmi_yillik_plan_2026_2027'),
(8,'Fen Bilimleri','DNA ve Genetik Kod','Mutasyon ve Modifikasyon','eski_2018','resmi_yillik_plan_2026_2027'),
(8,'Fen Bilimleri','DNA ve Genetik Kod','Adaptasyon','eski_2018','resmi_yillik_plan_2026_2027'),
(8,'Fen Bilimleri','DNA ve Genetik Kod','Biyoteknoloji','eski_2018','resmi_yillik_plan_2026_2027');
