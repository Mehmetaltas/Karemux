export const metadata = {
  title: "Karemux — LGS Ders Koçu",
  description: "Yapay zekâ destekli LGS konu anlatımı, soru üretimi ve kişisel çalışma planı.",
  manifest: "/manifest.json",
  themeColor: "#1F3D2E",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
