/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/tokens", "@repo/ui", "@repo/data"],
};
export default nextConfig;
