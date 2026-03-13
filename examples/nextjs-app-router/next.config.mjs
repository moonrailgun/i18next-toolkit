/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./public/locales/**/*"],
  },
};

export default nextConfig;
