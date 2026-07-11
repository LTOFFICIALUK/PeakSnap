import Link from "next/link";
import { Crosshair } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";

const SiteFooter = () => {
  return (
    <footer className="border-t border-[#23232a] bg-[#08080a]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2" aria-label={`${SITE.name} home`}>
              <Crosshair className="h-4 w-4 text-[#14f195]" aria-hidden />
              <span className="font-mono text-sm font-semibold">{SITE.name}</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-[#6b6b78]">{SITE.description}</p>
          </div>

          <div>
            <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">Platform</p>
            <ul className="space-y-2">
              <li>
                <Link href={SITE.drillHref} className="text-sm text-[#a8a8b5] hover:text-[#14f195]">
                  Daily drill
                </Link>
              </li>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#a8a8b5] hover:text-[#14f195]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="tag mb-3 inline-block px-2 py-1 text-[#6b6b78]">Legal</p>
            <ul className="space-y-2 text-sm text-[#6b6b78]">
              <li>Educational simulation only</li>
              <li>Not financial advice</li>
              <li>Solana memecoins are high risk</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#23232a] pt-6 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[#4a4a55] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span>Built for Solana traders · charts cached · APIs scaled smart</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
