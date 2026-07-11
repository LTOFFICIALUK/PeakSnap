import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_TIERS, SITE } from "@/lib/site";

type PricingSectionProps = {
  showHeading?: boolean;
};

const PricingSection = ({ showHeading = true }: PricingSectionProps) => {
  return (
    <section className="border-b border-[#23232a] py-16 sm:py-24" id="pricing">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {showHeading && (
          <div className="max-w-xl">
            <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">Access</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Free to try. Token to unlock.
            </h2>
            <p className="mt-3 text-[#6b6b78]">
              Scout tier runs today. Hold {SITE.tokenSymbol} for full decks when the token goes live.
            </p>
          </div>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.name}
              className={`panel flex flex-col p-6 ${
                tier.highlight ? "border-[#14f195]/40 ring-1 ring-[#14f195]/20" : ""
              }`}
            >
              {tier.highlight && (
                <span className="tag mb-4 inline-block w-fit px-2 py-1 text-[#14f195]">
                  most popular
                </span>
              )}
              <h3 className="font-mono text-lg font-semibold">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{tier.price}</span>
                {tier.tokens !== "0" && (
                  <span className="font-mono text-xs text-[#6b6b78]">
                    {tier.tokens} {SITE.tokenSymbol}
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#a8a8b5]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#14f195]" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.ctaHref}
                className={`mt-8 block py-3 text-center font-mono text-sm transition-colors ${
                  tier.highlight ? "btn-primary" : "btn-ghost"
                }`}
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
