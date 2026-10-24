# Dış seslendirme (gerçek öğretmen sesi)
1. Sessiz üretimle (`sessiz=true`, `onizleme=true`) `video-onizleme` dalındaki `mini-<id>.senaryo.json` dosyası slayt başına konuşma metnini verir.
2. Öğretmen her slaytı sırayla okur; dosyalar `dis-ses/<id>/s0.mp3`, `s1.mp3`, ... adıyla bu klasöre konur (wav/m4a/ogg de olur).
3. `Mini Ders Videosu Uret` iş akışı `dis_ses=true` ile çalıştırılır: slaytlar aynı hattan çizilir, ses bu dosyalardan alınır, ses kalite kontrolü uygulanır, maliyet muhasebeye yazılır.
Eksik dosya varsa o video üretilmez (hata verir).
