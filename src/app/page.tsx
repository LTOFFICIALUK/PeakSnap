import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — Solana reversal drill platform`,
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
  },
};

const HomePage = () => {
  return <LandingPage />;
};

export default HomePage;
