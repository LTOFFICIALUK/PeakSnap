import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";

const CtaBand = () => {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="panel relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_120%,rgba(20,241,149,0.15),transparent)]" />
          <div className="relative">
            <p className="tag mb-4 inline-block px-2 py-1 text-[#14f195]">Today&apos;s deck is live</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Stop watching pumps. Start reading them.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#6b6b78]">
              Five minutes a day. Real charts. No hindsight cheat codes.
            </p>
            <Link
              href={SITE.drillHref}
              className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3.5 font-mono text-sm"
            >
              Open the drill
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBand;
