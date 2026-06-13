import type { NextConfig } from "next";

const imageDomain = process.env.NEXT_PUBLIC_IMAGE_DOMAIN;
const imageProtocol: "http" | "https" = process.env.NEXT_PUBLIC_IMAGE_PROTOCOL === "http" ? "http" : "https";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(imageDomain
        ? [
            {
              protocol: imageProtocol,
              hostname: imageDomain,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
