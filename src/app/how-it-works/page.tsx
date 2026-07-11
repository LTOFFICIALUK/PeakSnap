import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Target, Zap } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import { SITE, STEPS } from "@/lib/site";

export const metadata: Metadata = {
  title: `How it works — ${SITE.name}`,
  description: "Learn how PeakSnap freezes memecoin charts before the reversal and trains your exit reflex.",
};

const HowItWorksPage = () => {
  return (
    <MarketingShell>
      <section className="border-b border-[#23232a] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">Product</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            The moment before the top
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[#6b6b78]">
            PeakSnap is not a signal group. It&apos;s a daily drill that puts you at the reversal point on
            real Solana memecoin charts — then makes you decide.
          </p>
        </div>
      </section>

      <HowItWorksSection />

      <section className="border-b border-[#23232a] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What happens on each card
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="panel p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#23232a] bg-[#08080a]">
                  <Target className="h-5 w-5 text-[#ffb3c1]" aria-hidden />
                </div>
                <h3 className="font-mono text-sm font-semibold">You see the freeze</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#6b6b78]">
                The chart stops at our reversal candidate — one candle before price rolls over. You
                see the pump, volume, and pattern tag. Nothing after the top is visible yet.
              </p>
            </article>

            <article className="panel p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[#23232a] bg-[#08080a]">
                  <Zap className="h-5 w-5 text-[#a5e8ff]" aria-hidden />
                </div>
                <h3 className="font-mono text-sm font-semibold">You commit</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#6b6b78]">
                Tap Exit or Hold. That locks your read. Only then does the chart replay forward so
                you watch the actual dump — or the rare continuation.
              </p>
            </article>
          </div>

          <div className="mt-10 panel p-6 sm:p-8">
            <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-[#14f195]">
              Behind the scenes
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#6b6b78]">
              {STEPS.map((step) => (
                <li key={step.step} className="flex gap-3">
                  <span className="font-mono text-[#14f195]/50">{step.step}</span>
                  <span>{step.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-semibold">Ready to drill?</h2>
          <Link
            href={SITE.drillHref}
            className="btn-primary mt-6 inline-flex items-center gap-2 px-8 py-3.5 font-mono text-sm"
          >
            Open today&apos;s deck
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
};

export default HowItWorksPage;
