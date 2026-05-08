import type { NextConfig } from "next";

function getUrlHost(urlValue?: string): string | null {
  if (!urlValue) {
    return null;
  }

  try {
    return new URL(urlValue).host;
  } catch {
    return null;
  }
}

function getUrlHostname(urlValue?: string): string | null {
  if (!urlValue) {
    return null;
  }

  try {
    return new URL(urlValue).hostname;
  } catch {
    return null;
  }
}

function getServerActionAllowedOrigins(): string[] {
  const port = process.env.PORT ?? "3000";
  const origins = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);

  for (const urlValue of [process.env.NEXT_PUBLIC_APP_URL]) {
    const host = getUrlHost(urlValue);

    if (host) {
      origins.add(host);
    }
  }

  return [...origins];
}

function getAllowedDevOrigins(): string[] {
  const origins = new Set(["localhost", "127.0.0.1"]);

  for (const urlValue of [process.env.NEXT_PUBLIC_APP_URL]) {
    const hostname = getUrlHostname(urlValue);

    if (hostname) {
      origins.add(hostname);
    }
  }

  return [...origins];
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "script-src-elem 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src 'self'",
  "connect-src 'self' https: wss:",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: getAllowedDevOrigins(),
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: getServerActionAllowedOrigins(),
    },
  },
  async headers() {
    const baseHeaders = [
      {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy,
      },
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
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      },
    ];

    const strictTransportSecurity =
      process.env.NODE_ENV === "production"
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=63072000; includeSubDomains; preload",
            },
          ]
        : [];

    return [
      {
        source: "/(.*)",
        headers: [...baseHeaders, ...strictTransportSecurity],
      },
    ];
  },
};

export default nextConfig;
