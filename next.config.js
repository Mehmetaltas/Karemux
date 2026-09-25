/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // 25 Eylul: Kurum logolari artik Vercel Blob'da barinacagi icin
    // next/image'in optimize edebilmesi icin bu domain izinli olmali.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
