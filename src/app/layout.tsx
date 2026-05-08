import localFont from "next/font/local";
import { Toaster } from "sonner";

import { getRootMetadata } from "@/server/seo/site-metadata";

import "./globals.css";

const dmSans = localFont({
  src: [
    {
      path: "../../public/fonts/dm-sans/DMSans-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/dm-sans/DMSans-Variable-Italic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../../public/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata = getRootMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "8px",
              fontFamily: "var(--font-dm-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
