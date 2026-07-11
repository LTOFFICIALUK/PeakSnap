"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";

type SiteHeaderProps = {
  variant?: "marketing" | "app";
};

const SiteHeader = ({ variant = "marketing" }: SiteHeaderProps) => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#23232a] bg-[#08080a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label={`${SITE.name} home`}
        >
          <Crosshair className="h-4 w-4 text-[#14f195]" aria-hidden />
          <span className="font-mono text-sm font-semibold tracking-tight">{SITE.name}</span>
        </Link>

        {variant === "marketing" && (
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-xs uppercase tracking-wider transition-colors ${
                  pathname === link.href
                    ? "text-[#14f195]"
                    : "text-[#6b6b78] hover:text-[#e8e8ef]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {variant === "app" && (
            <Link
              href="/"
              className="hidden font-mono text-xs text-[#6b6b78] transition-colors hover:text-[#e8e8ef] sm:inline"
            >
              Home
            </Link>
          )}
          <Link href={SITE.drillHref} className="btn-primary px-4 py-2 font-mono text-xs">
            {variant === "app" ? "Drill" : "Launch app"}
          </Link>
        </div>
      </div>

      {variant === "marketing" && (
        <nav
          className="flex gap-4 overflow-x-auto border-t border-[#23232a] px-4 py-2 md:hidden"
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 font-mono text-xs uppercase tracking-wider ${
                pathname === link.href ? "text-[#14f195]" : "text-[#6b6b78]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
