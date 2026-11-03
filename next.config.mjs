/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_BASE_URL:
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:4000/api/v1',
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      'http://localhost:4000/api/v1',
    ADMIN_API_KEY:
      process.env.ADMIN_API_KEY ||
      process.env.NEXT_PUBLIC_ADMIN_API_KEY ||
      '',
    NEXT_PUBLIC_ADMIN_API_KEY:
      process.env.NEXT_PUBLIC_ADMIN_API_KEY ||
      process.env.ADMIN_API_KEY ||
      '',
  },
};

export default nextConfig;
