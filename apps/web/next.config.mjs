/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/data", "@repo/types", "@repo/mock-db", "@repo/design-tokens"],
};
export default nextConfig;
