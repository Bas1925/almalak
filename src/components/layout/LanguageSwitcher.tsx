"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next; // replace the locale segment
    router.push(segments.join("/") || `/${next}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/70 px-3 py-2 text-sm font-medium text-sage-700 transition hover:border-sage-400 hover:bg-white"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{localeMeta[locale].nativeLabel}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-cream-300 bg-white p-1.5 shadow-card animate-fade-in"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => switchTo(l)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition",
                  l === locale
                    ? "bg-sage-50 font-semibold text-sage-700"
                    : "text-ink-soft hover:bg-cream-100",
                )}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{localeMeta[l].flag}</span>
                  {localeMeta[l].nativeLabel}
                </span>
                {l === locale && <Check className="h-4 w-4 text-sage-500" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
