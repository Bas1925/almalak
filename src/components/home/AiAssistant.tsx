"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Send,
  MessageCircle,
  Bot,
  Star,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { Product } from "@/types";
import { recommendGifts, type RecommendResult, type GiftReasons } from "@/lib/recommend";
import { whatsappLink, formatPrice, cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { SectionHeading } from "./Categories";

interface Turn {
  id: number;
  query: string;
  result: RecommendResult;
}

export function AiAssistant({
  dict,
  locale,
  products,
}: {
  dict: Dictionary;
  locale: Locale;
  products: Product[];
}) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // keep the conversation scrolled to the newest message
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function run(raw: string) {
    const query = raw.trim();
    if (!query || thinking) return;
    setInput("");
    setThinking(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const result = recommendGifts(query, products);
      setTurns((t) => [...t, { id: Date.now(), query, result }]);
      setThinking(false);
    }, 650);
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setTurns([]);
    setThinking(false);
    setInput("");
  }

  return (
    <section className="bg-gradient-to-b from-cream-100 to-sage-50 py-16 lg:py-20">
      <div className="container-px">
        <SectionHeading title={dict.ai.title} subtitle={dict.ai.subtitle} />

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="card overflow-hidden">
            {/* assistant header */}
            <div className="flex items-center justify-between gap-3 border-b border-cream-300 bg-sage-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-sage-500 text-white">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -end-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-sage-50 bg-emerald-400" />
                </span>
                <div>
                  <p className="text-sm font-bold text-sage-700">
                    {dict.brand.name} · {dict.ai.badge}
                  </p>
                  <p className="text-xs text-ink-soft">{dict.ai.subtitle}</p>
                </div>
              </div>
              {turns.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-sage-400 hover:text-sage-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{dict.ai.reset}</span>
                </button>
              )}
            </div>

            {/* conversation */}
            <div
              ref={scrollRef}
              className="max-h-[30rem] space-y-4 overflow-y-auto bg-cream-50/40 p-4 sm:p-6"
            >
              {/* greeting */}
              <Bubble role="assistant">{dict.ai.greeting}</Bubble>

              {turns.map((turn) => (
                <div key={turn.id} className="space-y-4">
                  <Bubble role="user" label={dict.ai.you}>
                    {turn.query}
                  </Bubble>
                  <AssistantAnswer
                    result={turn.result}
                    query={turn.query}
                    dict={dict}
                    locale={locale}
                  />
                </div>
              ))}

              {thinking && (
                <Bubble role="assistant">
                  <span className="inline-flex items-center gap-2 text-ink-soft">
                    <Sparkles className="h-4 w-4 animate-pulse text-gold-400" />
                    {dict.ai.thinking}
                    <TypingDots />
                  </span>
                </Bubble>
              )}
            </div>

            {/* composer */}
            <div className="border-t border-cream-300 bg-white p-4 sm:p-6">
              <div className="mb-3 flex flex-wrap gap-2">
                {dict.ai.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => run(s)}
                    className="rounded-full border border-cream-300 bg-cream-50 px-3 py-1.5 text-xs font-medium text-sage-700 transition hover:border-sage-400 hover:bg-white"
                  >
                    <Sparkles className="me-1 inline h-3 w-3 text-gold-400" />
                    {s}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(input);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={dict.ai.placeholder}
                  className="w-full rounded-full border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
                />
                <button
                  type="submit"
                  disabled={thinking}
                  className="btn-primary shrink-0 disabled:opacity-60"
                >
                  <Send className="h-4 w-4 flip-rtl" />
                  <span className="hidden sm:inline">{dict.ai.send}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── sub-components ─────────────────────────── */

function Bubble({
  role,
  label,
  children,
}: {
  role: "assistant" | "user";
  label?: string;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      {label && (
        <span className="mb-1 px-1 text-[11px] font-medium text-ink-soft/70">
          {label}
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-soft",
          isUser
            ? "rounded-ee-sm bg-sage-500 text-white"
            : "rounded-es-sm border border-cream-300 bg-white text-ink",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function AssistantAnswer({
  result,
  query,
  dict,
  locale,
}: {
  result: RecommendResult;
  query: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const lead = result.exact ? dict.ai.resultsLead : dict.ai.fallbackLead;
  const topCategory = result.categories[0] ?? result.suggestions[0]?.product.category;

  const waMessage = whatsappLink(
    `${dict.ai.title}\n— ${query}\n\n${result.suggestions
      .map((s) => `• ${s.product.name[locale]} — ${formatPrice(s.product.price, dict.product.currency)}`)
      .join("\n")}`,
  );

  return (
    <div className="flex flex-col items-start">
      <div className="w-full max-w-[92%] space-y-3 rounded-2xl rounded-es-sm border border-cream-300 bg-white p-4 shadow-soft">
        <p className="text-sm font-medium text-ink">{lead}</p>

        {/* understood filters */}
        {(result.categories.length > 0 || result.budgetMax != null) && (
          <div className="flex flex-wrap gap-1.5">
            {result.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-sage-100 px-2.5 py-0.5 text-[11px] font-semibold text-sage-700"
              >
                {dict.categories.items[cat]}
              </span>
            ))}
            {result.budgetMax != null && (
              <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-semibold text-gold-500">
                {dict.ai.budgetLabel}: ≤ {formatPrice(result.budgetMax, dict.product.currency)}
              </span>
            )}
          </div>
        )}

        {/* picks */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {result.suggestions.map((s) => (
            <PickCard
              key={s.product.id}
              product={s.product}
              reasons={s.reasons}
              dict={dict}
              locale={locale}
            />
          ))}
        </div>

        {/* actions */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <a
            href={waMessage}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp flex-1"
          >
            <MessageCircle className="h-4 w-4" />
            {dict.actions.whatsapp}
          </a>
          {topCategory && (
            <Link
              href={`/${locale}/category/${topCategory}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-sage-700 transition hover:border-sage-400 hover:bg-white"
            >
              {dict.ai.viewCategory}
              <ArrowRight className="h-4 w-4 flip-rtl" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PickCard({
  product,
  reasons,
  dict,
  locale,
}: {
  product: RecommendResult["suggestions"][number]["product"];
  reasons: GiftReasons;
  dict: Dictionary;
  locale: Locale;
}) {
  const tags: string[] = [];
  if (reasons.catMatch) tags.push(dict.ai.reasons.match);
  if (reasons.inBudget) tags.push(dict.ai.reasons.budget);
  if (reasons.bestSeller) tags.push(dict.ai.reasons.best);
  else if (reasons.topRated) tags.push(dict.ai.reasons.top);

  return (
    <div className="flex gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-2.5">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={product.image}
          alt={product.name[locale]}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="line-clamp-2 text-sm font-semibold text-ink">
          {product.name[locale]}
        </p>
        {product.reviewCount > 0 && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-soft">
            <Star className="h-3 w-3 fill-gold-300 text-gold-400" />
            <span className="font-medium text-ink">{product.rating}</span>
            <span>({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-display font-bold text-sage-600">
            {formatPrice(product.price, dict.product.currency)}
          </span>
          {product.compareAt && (
            <span className="text-xs text-ink-soft line-through">
              {formatPrice(product.compareAt, dict.product.currency)}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-sage-700 ring-1 ring-cream-300"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <AddToCartButton
          product={product}
          label={dict.actions.addToCart}
          addedLabel={dict.actions.added}
          icon="plus"
          className="mt-2 inline-flex items-center justify-center gap-1 self-start rounded-full bg-sage-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sage-600"
        />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-sage-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
