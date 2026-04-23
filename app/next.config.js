/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
