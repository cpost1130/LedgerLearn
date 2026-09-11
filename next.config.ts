import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://*.correct-counts.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.correct-counts.com",
              "img-src 'self' data: https: blob: https://img.clerk.com https://*.correct-counts.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://*.clerk.accounts.dev https://*.clerk.com https://*.correct-counts.com https://js.stripe.com https://hooks.stripe.com",
              "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.correct-counts.com https://api.stripe.com https://*.neon.tech",
              "worker-src 'self' https://*.clerk.accounts.dev https://*.correct-counts.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.clerk.com https://*.correct-counts.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
