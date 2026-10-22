DELETE FROM mufredat WHERE ders = 'Ingilizce' AND sinif IN (4, 7, 8);

INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi) VALUES
(4,'Ingilizce','Classroom Rules','Asking for permission','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Classroom Rules','Making simple requests','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Classroom Rules','Telling someone what to do','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Classroom Rules','Naming numbers','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Nationality','Identifying countries and nationalities','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Nationality','Talking about locations of cities','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Cartoon Characters','Expressing ability and inability','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Cartoon Characters','Talking about possessions','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Free Time','Expressing likes and dislikes','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Free Time','Making simple inquiries','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Free Time','Asking for clarification','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Day','Talking about daily routines','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Day','Making simple inquiries','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Day','Telling the time and days','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Fun with Science','Giving and responding to simple instructions','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Fun with Science','Making simple inquiries','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Fun with Science','Talking about locations','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Jobs','Describing what people do and expressing what people like','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Jobs','Making inquiries','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Clothes','Describing the weather','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Clothes','Making simple requests','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Clothes','Naming the seasons of the year','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Friends','Describing people','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','My Friends','Talking about possessions','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Food and Drinks','Making offers','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(4,'Ingilizce','Food and Drinks','Expressing basic needs and feelings','yeni_maarif_2024','resmi_yillik_plan_2026_2027')
ON CONFLICT (sinif, ders, unite, alt_konu) DO NOTHING;

INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi)
SELECT a.s, 'Ingilizce', a.u, b.k, a.t, 'resmi_yillik_plan_2026_2027'
FROM (VALUES (7,'Appearance And Personality','yeni_maarif_2024'), (7,'Sports','yeni_maarif_2024'), (7,'Biographies','yeni_maarif_2024'), (7,'Wild Animals','yeni_maarif_2024'), (7,'Television','yeni_maarif_2024'), (7,'Celebrations','yeni_maarif_2024'), (7,'Dreams','yeni_maarif_2024'), (7,'Public Buildings','yeni_maarif_2024'), (7,'Environment','yeni_maarif_2024'), (7,'Planets','yeni_maarif_2024'), (8,'Friendship','eski_2018'), (8,'Teen Life','eski_2018'), (8,'In The Kitchen','eski_2018'), (8,'On The Phone','eski_2018'), (8,'The Internet','eski_2018'), (8,'Adventures','eski_2018'), (8,'Tourism','eski_2018'), (8,'Chores','eski_2018'), (8,'Science','eski_2018'), (8,'Natural Forces','eski_2018')) AS a(s, u, t)
CROSS JOIN (VALUES ('Dinleme (Listening)'), ('Konusma (Speaking)'), ('Okuma (Reading)'), ('Yazma (Writing)')) AS b(k)
ON CONFLICT (sinif, ders, unite, alt_konu) DO NOTHING;

SELECT sinif, count(*) FROM mufredat WHERE ders = 'Ingilizce' AND sinif IN (4, 7, 8) GROUP BY sinif ORDER BY sinif;

WITH sil1 AS (DELETE FROM mufredat WHERE sinif = 8 AND ders = 'Fen Bilimleri' AND alt_konu = 'Isinma ve Hal Degisimi' RETURNING 1), sil2 AS (DELETE FROM mufredat WHERE sinif = 6 AND ders = 'Matematik' AND alt_konu = 'Dogal Sayilarin Carpanlari ve Katlari' RETURNING 1)
INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi) VALUES
(8,'Fen Bilimleri','DNA ve Genetik Kod','Biyoteknoloji','eski_2018','resmi_yillik_plan_2026_2027'),
(8,'Fen Bilimleri','Madde ve Endustri','Kimyasal Tepkimeler','eski_2018','resmi_yillik_plan_2026_2027'),
(8,'Fen Bilimleri','Madde ve Endustri','Asitler ve Bazlar','eski_2018','resmi_yillik_plan_2026_2027'),
(5,'Fen Bilimleri','Gokyuzundeki Komsularimiz ve Biz','Dunya''miz ve Gokyuzundeki Komsularimiz','yeni_maarif_2024','resmi_yillik_plan_2026_2027')
ON CONFLICT (sinif, ders, unite, alt_konu) DO NOTHING;
