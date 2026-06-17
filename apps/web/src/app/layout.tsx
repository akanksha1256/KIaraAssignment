import type { Metadata } from "next";
import { Albert_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@repo/ui";
import { DevToolbar } from "@/client/components/DevToolbar";

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
        {/* Sentient is not on Google Fonts so next/font can't manage it.
            preconnect + stylesheet with display=swap gives font-display:swap
            on the @font-face Fontshare generates, matching Next.js behaviour. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://api.fontshare.com/v2/css?f[]=sentient@500,600&display=swap"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=sentient@500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${albertSans.variable} font-sans`}>
        <Providers>
          {children}
          <DevToolbar />
        </Providers>
      </body>
    </html>
  );
}
