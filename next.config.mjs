const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const netlifySiteUrl = process.env.NETLIFY && process.env.URL;
let url =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL ||
    netlifySiteUrl ||
    `https://${vercelProductionUrl}`
    : "http://localhost:3025";
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: url,
    NEXT_PUBLIC_SITE_URL: url,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
