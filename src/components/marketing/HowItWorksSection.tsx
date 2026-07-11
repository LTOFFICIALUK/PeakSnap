import { STEPS } from "@/lib/site";

const HowItWorksSection = () => {
  return (
    <section className="border-b border-[#23232a] py-16 sm:py-24" id="how-it-works">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">Process</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three moves. Daily habit.
          </h2>
          <p className="mt-3 text-[#6b6b78]">
            No 40-minute courses. Open the deck, drill reversals, build reflex.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.step} className="panel p-6">
              <span className="font-mono text-2xl font-semibold text-[#14f195]/40">
                {step.step}
              </span>
              <h3 className="mt-4 font-mono text-sm font-semibold uppercase tracking-wide">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#6b6b78]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
