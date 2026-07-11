"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ } from "@/lib/site";

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle(index);
    }
  };

  return (
    <section className="border-b border-[#23232a] py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">FAQ</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Straight answers
          </h2>
        </div>

        <div className="mt-10 space-y-2">
          {FAQ.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.q} className="panel overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="font-mono text-sm font-medium">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#6b6b78] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <p className="border-t border-[#23232a] px-5 py-4 text-sm leading-relaxed text-[#6b6b78]">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
