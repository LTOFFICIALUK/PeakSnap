import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import SessionInit from "@/components/SessionInit";
import { SITE } from "@/lib/site";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Solana reversal drill platform`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexMono.variable} antialiased scanline`}>
        <SessionInit />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
