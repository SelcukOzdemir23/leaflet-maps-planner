/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  // Eski stil dosyalarını desteklemek için
  sassOptions: {
    includePaths: ['./styles'],
  },
};

module.exports = nextConfig;