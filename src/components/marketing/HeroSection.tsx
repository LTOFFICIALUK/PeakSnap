import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { SITE } from "@/lib/site";
import HeroChart from "./HeroChart";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden border-b border-[#23232a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(20,241,149,0.12),transparent)]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="tag mb-4 inline-block px-2 py-1 text-[#14f195]">
            solana memecoin training
          </p>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Would you have{" "}
            <span className="text-[#14f195]">sold here?</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#a8a8b5] sm:text-lg">
            {SITE.tagline} Train on real pumps — chart frozen one candle before the top.
            Guess exit or hold, then replay the dump.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={SITE.drillHref}
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 font-mono text-sm"
            >
              Start today&apos;s deck
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/how-it-works"
              className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3.5 font-mono text-sm"
            >
              <Play className="h-4 w-4" aria-hidden />
              See how it works
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 font-mono text-xs text-[#6b6b78]">
            <div>
              <span className="block text-lg font-semibold text-[#e8e8ef]">10+</span>
              cards / day
            </div>
            <div>
              <span className="block text-lg font-semibold text-[#e8e8ef]">1</span>
              API fetch → ∞ users
            </div>
            <div>
              <span className="block text-lg font-semibold text-[#14f195]">Live</span>
              Solana data
            </div>
          </div>
        </div>

        <HeroChart />
      </div>
    </section>
  );
};

export default HeroSection;
