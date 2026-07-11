import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import PricingSection from "@/components/marketing/PricingSection";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Pricing — ${SITE.name}`,
  description: "Free scout tier and token-gated access for full Solana reversal drills.",
};

const PricingPage = () => {
  return (
    <MarketingShell>
      <section className="border-b border-[#23232a] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">Pricing</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Pay with attention — or hold {SITE.tokenSymbol}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#6b6b78]">
            Start free on Scout. Upgrade when you want the full daily deck and unlimited replays.
          </p>
        </div>
      </section>

      <PricingSection showHeading={false} />

      <section className="py-16 sm:py-24" id="access">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="panel p-8 text-center sm:p-10">
            <p className="tag mb-4 inline-block px-2 py-1 text-[#14f195]">Token access</p>
            <h2 className="text-2xl font-semibold">Wallet gate coming with TGE</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#6b6b78]">
              Connect your Phantom wallet and hold the required {SITE.tokenSymbol} balance to unlock
              tiers. The check runs on-chain via Helius — no subscription, no Stripe.
            </p>
            <p className="mt-6 font-mono text-xs text-[#4a4a55]">
              Token contract address announced at launch
            </p>
            <Link
              href={SITE.drillHref}
              className="btn-primary mt-8 inline-flex items-center gap-2 px-6 py-3 font-mono text-sm"
            >
              Use free tier now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
};

export default PricingPage;
