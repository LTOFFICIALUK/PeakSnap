import { FEATURES } from "@/lib/site";
import {
  BarChart3,
  Brain,
  Coins,
  Database,
  Pause,
  Tags,
} from "lucide-react";

const ICONS = [BarChart3, Pause, Tags, Brain, Coins, Database] as const;

const FeaturesSection = () => {
  return (
    <section className="border-b border-[#23232a] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">Platform</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for degens who want to get sharper
          </h2>
          <p className="mt-3 text-[#6b6b78]">
            Everything you need to drill reversals — without another generic chart terminal.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = ICONS[i];
            return (
              <article key={feature.title} className="panel p-6">
                <Icon className="h-5 w-5 text-[#14f195]" aria-hidden />
                <h3 className="mt-4 font-mono text-sm font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b6b78]">{feature.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
