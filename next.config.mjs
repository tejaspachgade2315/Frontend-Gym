
/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      }
    ],
  },
}

export default nextConfig
