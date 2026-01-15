/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true, 
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", 
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true, 
};

module.exports = nextConfig;
