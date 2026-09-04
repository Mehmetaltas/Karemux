#!/usr/bin/env python3
"""
API Kullanim Denetimi (4 Eylul 2026'da kuruldu)

Amac: "Backend API var ama hicbir frontend'den cagrilmiyor" gibi
unutulmus/yaridan-birakilmis ozellikleri erken yakalamak.

Kullanim: Her buyuk ozellik turunun SONUNDA calistir:
  python3 scripts/api-kullanim-denetimi.py

Bilinen yanlis pozitifler (dogal olarak frontend'den cagrilmaz):
  - /api/cron/*  (zamanlanmis gorevler)
  - /api/telegram/webhook  (disaridan tetiklenir)
  - /api/*/callback  (odeme saglayicisi yonlendirir, fetch degil)
Tarama scripti icin frontend_files listesine YENI bir sayfa eklerseniz
(orn. yeni /veli, /kurum gibi) buraya da ekleyin.
"""
import os

FRONTEND_FILES = [
    "app/page.js", "app/admin/page.js", "app/ogretmen/page.js",
    "app/kurum/page.js", "app/veli/page.js", "app/veli-giris/page.js",
    "app/iletisim/page.js", "app/kariyer/page.js", "app/ogretmen-basvuru/page.js",
    "app/ogretmen-giris/page.js", "app/ogretmen-sifre-belirle/page.js",
    "app/personel-sifre-belirle/page.js",
]

DOGAL_ISTISNALAR = ("/api/cron/", "/api/telegram/", "/callback")

def main():
    route_files = []
    for root, dirs, files in os.walk("app/api"):
        if "node_modules" in root:
            continue
        for f in files:
            if f == "route.js":
                route_files.append(os.path.join(root, f))

    frontend_content = ""
    for ff in FRONTEND_FILES:
        if os.path.exists(ff):
            with open(ff, encoding="utf-8") as f:
                frontend_content += f.read()

    all_route_content = ""
    for rf in route_files:
        with open(rf, encoding="utf-8") as f:
            all_route_content += f.read()

    supheli = []
    for rf in route_files:
        api_path = "/" + os.path.dirname(rf).replace("\\", "/")
        api_path = api_path.replace("/app/api", "/api")
        if any(ist in api_path for ist in DOGAL_ISTISNALAR):
            continue
        if api_path in frontend_content or api_path in all_route_content:
            continue
        supheli.append(api_path)

    print(f"Toplam route: {len(route_files)}")
    print(f"Suphelilerin sayisi (dogal istisnalar haric): {len(supheli)}\n")
    for s in sorted(supheli):
        print(s)

if __name__ == "__main__":
    main()
