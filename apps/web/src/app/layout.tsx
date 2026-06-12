import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@repo/ui";
import { Nav } from "@repo/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RentPortal",
  description: "Rent management portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
