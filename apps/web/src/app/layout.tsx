import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@repo/ui";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-albert-sans",
});

export const metadata: Metadata = {
  title: "Kiara",
  description: "AI rental property management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Sentient serif via Fontshare (not on Google Fonts) */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=sentient@500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${albertSans.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
