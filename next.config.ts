import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points explicitly at our request config so the plugin doesn't have to guess its location.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
