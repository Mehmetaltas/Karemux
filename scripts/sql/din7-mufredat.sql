INSERT INTO mufredat (sinif, ders, unite, alt_konu, mufredat_turu, dogrulanma_kaynagi) VALUES
(7,'Din Kulturu','Melek ve Ahiret Inanci','Varliklar Alemi','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Melek ve Ahiret Inanci','Dunya ve Ahiret Hayati','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Melek ve Ahiret Inanci','Melek ve Ahiret Inancinin Insana Kazandirdiklari','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Melek ve Ahiret Inanci','Bir Sure Ogreniyorum: Nas Suresi','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Hac Umre ve Kurban','Hac ve Umre Ibadeti','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Hac Umre ve Kurban','Kurban Ibadeti','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Hac Umre ve Kurban','Hac ve Kurban Ibadetinin Kulturumuze Yansimalari','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Hac Umre ve Kurban','Bir Sure Ogreniyorum: Kafirun Suresi','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Islam Dusuncesinde Yorumlar','Din Anlayisindaki Yorum Farkliliklari','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Islam Dusuncesinde Yorumlar','Islam Dusuncesinde Yorum Bicimleri','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Islam Dusuncesinde Yorumlar','Kulturumuzdeki Tasavvufi Yorumlar','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Islam Dusuncesinde Yorumlar','Alevilik Bektasilik ile Ilgili Temel Kavramlar ve Cem Erkanlari','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Peygamber Olarak Hz. Muhammed','Hz. Muhammed''in Daveti: Mekke Donemi','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Peygamber Olarak Hz. Muhammed','Hicret','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Peygamber Olarak Hz. Muhammed','Hz. Muhammed''in Daveti: Medine Donemi','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Peygamber Olarak Hz. Muhammed','Bir Sure Ogreniyorum: Nasr Suresi','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Yasayan Dunya Dinleri','Yahudilik','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Yasayan Dunya Dinleri','Hristiyanlik','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Yasayan Dunya Dinleri','Hinduizm','yeni_maarif_2024','resmi_yillik_plan_2026_2027'),
(7,'Din Kulturu','Yasayan Dunya Dinleri','Budizm','yeni_maarif_2024','resmi_yillik_plan_2026_2027')
ON CONFLICT (sinif, ders, unite, alt_konu) DO UPDATE SET mufredat_turu = EXCLUDED.mufredat_turu, dogrulanma_kaynagi = EXCLUDED.dogrulanma_kaynagi;

SELECT count(*) FROM mufredat WHERE sinif = 7 AND ders = 'Din Kulturu';
