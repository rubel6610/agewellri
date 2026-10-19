
import type { NextConfig } from "next";
const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",").map((origin) => origin.trim())
  : ["localhost:3000", "http://localhost:3000"];

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins,
};

export default nextConfig;
