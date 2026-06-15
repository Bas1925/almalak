"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Type,
  Palette,
  MessageCircle,
  Sparkles,
  Minus,
  Plus,
  X,
  Pencil,
  Info,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { whatsappLink, formatPrice, cn } from "@/lib/utils";
import { SectionHeading } from "./Categories";

type PrintableId = keyof Dictionary["customPrinting"]["products"];
type ColorId = keyof Dictionary["customPrinting"]["colorNames"];
type FontId = keyof Dictionary["customPrinting"]["fontNames"];

const PRINTABLES: Array<{ id: PrintableId; emoji: string; price: number }> = [
  { id: "frame", emoji: "🖼️", price: 150 },
  { id: "bag", emoji: "👜", price: 70 },
  { id: "bottle", emoji: "🍶", price: 55 },
  { id: "mug", emoji: "☕", price: 65 },
];

const FONTS: Array<{ id: FontId; cls: string }> = [
  { id: "classic", cls: "font-display font-normal" },
  { id: "modern", cls: "font-sans font-medium" },
  { id: "bold", cls: "font-sans font-extrabold uppercase tracking-wide" },
];

const TEXT_COLORS: Array<{ id: ColorId; hex: string }> = [
  { id: "green", hex: "#46522E" },
  { id: "black", hex: "#2C2A26" },
  { id: "magenta", hex: "#BE4368" },
  { id: "gold", hex: "#AE8636" },
  { id: "white", hex: "#FFFFFF" },
];

const BG_COLORS: Array<{ id: ColorId; hex: string }> = [
  { id: "cream", hex: "#FAF6EF" },
  { id: "sage", hex: "#E3E8D5" },
  { id: "blush", hex: "#FBE3EA" },
  { id: "champagne", hex: "#F3E7C6" },
  { id: "olive", hex: "#C6D0AC" },
  { id: "rose", hex: "#F6C6D4" },
];

export function CustomPrinting({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const cp = dict.customPrinting;
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [bgId, setBgId] = useState<ColorId>(BG_COLORS[0].id);
  const [textColorId, setTextColorId] = useState<ColorId>(TEXT_COLORS[0].id);
  const [fontId, setFontId] = useState<FontId>(FONTS[0].id);
  const [productId, setProductId] = useState<PrintableId>(PRINTABLES[0].id);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(f);
  }

  function clearImage() {
    setImage(null);
    setFile(null);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const product = PRINTABLES.find((p) => p.id === productId)!;
  const productName = cp.products[productId];
  const bg = BG_COLORS.find((c) => c.id === bgId)!;
  const textColor = TEXT_COLORS.find((c) => c.id === textColorId)!;
  const font = FONTS.find((f) => f.id === fontId)!;
  const total = product.price * qty;

  function buildMessage(): string {
    const lines = [
      `🎨 ${cp.orderTitle} — ${dict.brand.name}`,
      `• ${cp.productLabel}: ${productName} × ${qty}`,
    ];
    if (text) lines.push(`• ${cp.textLabel}: "${text}"`);
    lines.push(`• ${cp.fontLabel}: ${cp.fontNames[fontId]}`);
    lines.push(`• ${cp.textColorLabel}: ${cp.colorNames[textColorId]}`);
    lines.push(`• ${cp.colorLabel}: ${cp.colorNames[bgId]}`);
    if (notes) lines.push(`• ${cp.notesLabel}: ${notes}`);
    lines.push(`• ${cp.priceLabel}: ${formatPrice(total, dict.product.currency)}`);
    lines.push(image ? `📷 ${cp.photoSelected} ✓` : "");
    return lines.filter(Boolean).join("\n");
  }

  async function submitOrder() {
    const message = buildMessage();
    // Best path: share the real photo + text together via the OS share sheet
    // (works on mobile WhatsApp). Falls back to a wa.me text link otherwise.
    if (file && typeof navigator !== "undefined" && typeof navigator.canShare === "function") {
      try {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: message, title: cp.orderTitle });
          return;
        }
      } catch {
        /* user dismissed or sharing failed — fall through to wa.me */
      }
    }
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <section
      id="custom"
      className="bg-gradient-to-b from-sage-50 to-cream-100 py-16 lg:py-20"
    >
      <div className="container-px">
        <SectionHeading title={cp.title} subtitle={cp.subtitle} />

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* ── Controls ── */}
          <div className="card space-y-6 p-6 sm:p-8">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              {cp.badge}
            </span>

            {/* product */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-sage-700">
                {cp.productLabel}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRINTABLES.map((p) => {
                  const active = productId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProductId(p.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition",
                        active
                          ? "border-sage-500 bg-sage-50 shadow-soft"
                          : "border-cream-300 bg-white hover:border-sage-300",
                      )}
                    >
                      <span className="text-2xl leading-none">{p.emoji}</span>
                      <span className="text-[11px] font-semibold leading-tight text-ink">
                        {cp.products[p.id]}
                      </span>
                      <span className="text-[11px] font-bold text-sage-600">
                        {formatPrice(p.price, dict.product.currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* quantity */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-sage-700">
                {cp.quantityLabel}
              </label>
              <div className="inline-flex items-center gap-1 rounded-full border border-cream-300 bg-cream-50 p-1">
                <button
                  type="button"
                  aria-label="-"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-sage-700 shadow-soft transition hover:bg-sage-50 active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-base font-bold text-ink">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="+"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-sage-700 shadow-soft transition hover:bg-sage-50 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* upload */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-sage-700">
                <Upload className="me-1 inline h-4 w-4" />
                {cp.uploadLabel}
              </label>
              {image ? (
                <div className="flex items-center gap-3 rounded-2xl border border-sage-200 bg-sage-50 p-2.5">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <Image src={image} alt="upload" fill className="object-cover" unoptimized />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-sage-700">
                    {fileName || cp.photoSelected}
                  </span>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-ink-soft transition hover:text-blossom-500"
                    aria-label={cp.removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-sage-200 bg-cream-50 px-4 py-6 text-center transition hover:border-sage-400"
                >
                  <Upload className="h-6 w-6 text-sage-400" />
                  <span className="text-xs text-ink-soft">{cp.uploadHint}</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={onFile}
              />
            </div>

            {/* text */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-sage-700">
                  <Type className="me-1 inline h-4 w-4" />
                  {cp.textLabel}
                </label>
                <span className="text-[11px] text-ink-faint">{text.length}/40</span>
              </div>
              <input
                type="text"
                value={text}
                maxLength={40}
                onChange={(e) => setText(e.target.value)}
                placeholder={cp.textPlaceholder}
                className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
              />

              {/* font + text colour */}
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div>
                  <span className="mb-1 block text-[11px] font-medium text-ink-soft">
                    {cp.fontLabel}
                  </span>
                  <div className="flex gap-1.5">
                    {FONTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontId(f.id)}
                        title={cp.fontNames[f.id]}
                        className={cn(
                          "h-9 w-9 rounded-xl border text-base transition",
                          f.cls,
                          fontId === f.id
                            ? "border-sage-500 bg-sage-50 text-sage-700"
                            : "border-cream-300 bg-white text-ink-soft hover:border-sage-300",
                        )}
                      >
                        Aa
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-[11px] font-medium text-ink-soft">
                    {cp.textColorLabel}
                  </span>
                  <div className="flex gap-1.5">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTextColorId(c.id)}
                        aria-label={cp.colorNames[c.id]}
                        title={cp.colorNames[c.id]}
                        style={{ backgroundColor: c.hex }}
                        className={cn(
                          "h-7 w-7 rounded-full border-2 transition",
                          textColorId === c.id
                            ? "scale-110 border-sage-500"
                            : "border-cream-300 shadow-soft",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* background colour */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-sage-700">
                <Palette className="me-1 inline h-4 w-4" />
                {cp.colorLabel}
              </label>
              <div className="flex gap-2">
                {BG_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setBgId(c.id)}
                    aria-label={cp.colorNames[c.id]}
                    title={cp.colorNames[c.id]}
                    style={{ backgroundColor: c.hex }}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition",
                      bgId === c.id ? "scale-110 border-sage-500" : "border-white shadow-soft",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* notes */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-sage-700">
                <Pencil className="me-1 inline h-4 w-4" />
                {cp.notesLabel}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={cp.notesPlaceholder}
                className="w-full resize-none rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
              />
            </div>
          </div>

          {/* ── Live preview + summary ── */}
          <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
            <span className="mb-3 text-center text-sm font-semibold text-sage-700">
              {cp.previewLabel}
            </span>

            <div
              className="relative flex min-h-[18rem] flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-cream-300 p-8 shadow-soft transition-colors duration-300"
              style={{ backgroundColor: bg.hex }}
            >
              {/* product + qty badge */}
              <span className="absolute start-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sage-700 backdrop-blur">
                {product.emoji} {productName} × {qty}
              </span>

              <div className="relative flex flex-col items-center gap-4">
                <div className="relative grid h-44 w-44 place-items-center overflow-hidden rounded-3xl bg-white/70 text-7xl shadow-card backdrop-blur">
                  {image ? (
                    <Image
                      src={image}
                      alt="preview"
                      fill
                      className="rounded-3xl object-cover"
                      unoptimized
                    />
                  ) : (
                    <span>{product.emoji}</span>
                  )}
                </div>
                <p
                  className={cn(
                    "max-w-[14rem] break-words text-center text-xl font-bold",
                    font.cls,
                  )}
                  style={{ color: textColor.hex }}
                >
                  {text || cp.previewDefault}
                </p>
              </div>
            </div>

            {/* order summary */}
            <div className="mt-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-soft">
              <p className="mb-2 text-sm font-bold text-sage-700">{cp.summaryTitle}</p>
              <div className="flex items-center justify-between text-sm text-ink-soft">
                <span>
                  {productName} × {qty}
                </span>
                <span className="font-display text-lg font-bold text-sage-600">
                  {formatPrice(total, dict.product.currency)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={submitOrder}
              className="btn-whatsapp mt-3 w-full"
            >
              <MessageCircle className="h-4 w-4" />
              {cp.cta}
            </button>

            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-soft">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-500" />
              {cp.attachNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
