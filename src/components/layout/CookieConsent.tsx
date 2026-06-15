"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import type { Locale } from "@/i18n/config";

const KEY = "almalak.cookieConsent";

export function CookieConsent({
  locale,
  message,
  accept,
  decline,
  learnMore,
}: {
  locale: Locale;
  message: string;
  accept: string;
  decline: string;
  learnMore: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function decide(value: "accepted" | "declined") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-cream-300 bg-white/95 p-4 shadow-card backdrop-blur sm:flex-row sm:gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage-50 text-sage-600">
          <Cookie className="h-5 w-5" />
        </span>
        <p className="flex-1 text-center text-sm text-ink-soft sm:text-start">
          {message}{" "}
          <Link
            href={`/${locale}/policies/privacy`}
            className="font-semibold text-sage-700 underline underline-offset-2 hover:text-sage-800"
          >
            {learnMore}
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => decide("declined")}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-cream-100"
          >
            {decline}
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="btn-primary !py-2"
          >
            {accept}
          </button>
        </div>
      </div>
    </div>
  );
}
