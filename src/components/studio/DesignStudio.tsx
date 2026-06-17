"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Type,
  Upload,
  Sparkles,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  FolderOpen,
  ArrowRight,
  Loader2,
  MessageCircle,
  Bold,
  Italic,
  AlignRight,
  AlignCenter,
  AlignLeft,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { cn, formatPrice, whatsappLink } from "@/lib/utils";
import { SectionHeading } from "../home/Categories";
import { STUDIO_PRODUCTS, type StudioProduct } from "./studio-products";
import { useDesignEditor, type EditorSelection } from "./useDesignEditor";

const FONTS = ["Cairo", "Amiri", "Poppins", "Cormorant Garamond", "Heebo"];
const COLORS = ["#2C2A26", "#FFFFFF", "#6F8049", "#BE4368", "#AE8636", "#2563eb", "#dc2626"];

export function DesignStudio({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const cp = dict.customPrinting;
  const [productId, setProductId] = useState<StudioProduct["id"] | null>(null);
  const product = STUDIO_PRODUCTS.find((p) => p.id === productId) ?? null;

  return (
    <section id="custom" className="bg-gradient-to-b from-sage-50 to-cream-100 py-16 lg:py-20">
      <div className="container-px">
        <SectionHeading title={cp.title} subtitle={cp.subtitle} />

        <div className="mx-auto mt-10 max-w-6xl">
          {!product ? (
            <ProductGrid dict={dict} onSelect={setProductId} />
          ) : (
            <Editor
              key={product.id}
              product={product}
              dict={dict}
              locale={locale}
              onBack={() => setProductId(null)}
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── product grid ─────────────────── */

function ProductGrid({
  dict,
  onSelect,
}: {
  dict: Dictionary;
  onSelect: (id: StudioProduct["id"]) => void;
}) {
  const cp = dict.customPrinting;
  return (
    <div>
      <p className="mb-6 text-center text-sm font-medium text-ink-soft">{dict.studio.pick}</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STUDIO_PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="card group flex flex-col overflow-hidden p-0 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[#15130f]">
              <Image
                src={p.mockup}
                alt={cp.products[p.id]}
                fill
                sizes="(max-width:640px) 50vw, 25vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="font-semibold text-ink">{cp.products[p.id]}</span>
              <span className="font-display font-bold text-sage-600">
                {formatPrice(p.price, dict.product.currency)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── editor ─────────────────── */

function Editor({
  product,
  dict,
  locale,
  onBack,
}: {
  product: StudioProduct;
  dict: Dictionary;
  locale: Locale;
  onBack: () => void;
}) {
  const cp = dict.customPrinting;
  const st = dict.studio;
  const ed = useDesignEditor(product, dict.customPrinting.textPlaceholder);

  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) await ed.addImageFromFile(f);
    e.target.value = "";
  }

  async function generateAi() {
    const p = aiPrompt.trim();
    if (!p || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p }),
      });
      if (!res.ok) {
        setAiError(res.status === 503 ? cp.aiNotConfigured : cp.aiError);
        return;
      }
      const data = await res.json();
      if (data?.image) await ed.addImageFromUrl(data.image);
      else setAiError(cp.aiError);
    } catch {
      setAiError(cp.aiError);
    } finally {
      setAiLoading(false);
    }
  }

  function exportPng() {
    const url = ed.exportPNG();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `almalak-${product.id}.png`;
    a.click();
  }

  function saveProject() {
    const blob = new Blob([ed.getJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `almalak-${product.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function openProject(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) await ed.loadJSONString(await f.text());
    e.target.value = "";
  }

  async function orderWhatsApp() {
    const url = ed.exportPNG();
    const message = `🎨 ${cp.orderTitle} — ${dict.brand.name}\n• ${cp.productLabel}: ${cp.products[product.id]}\n• ${cp.priceLabel}: ${formatPrice(product.price, dict.product.currency)}`;
    if (url) {
      try {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], `almalak-${product.id}.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: message, title: cp.orderTitle });
          return;
        }
      } catch {
        /* fall through */
      }
    }
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="card overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-cream-300 bg-cream-50 px-3 py-2.5">
        <button type="button" onClick={onBack} className="btn-outline !px-3 !py-1.5 text-xs">
          <ArrowRight className="h-4 w-4 flip-rtl" />
          {st.back}
        </button>
        <span className="mx-1 hidden text-sm font-semibold text-sage-700 sm:inline">
          {cp.products[product.id]}
        </span>
        <div className="flex-1" />
        <ToolBtn label={st.undo} onClick={ed.undo} disabled={!ed.canUndo}>
          <Undo2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label={st.redo} onClick={ed.redo} disabled={!ed.canRedo}>
          <Redo2 className="h-4 w-4" />
        </ToolBtn>
        <Divider />
        <ToolBtn label={st.layerUp} onClick={ed.bringForward}>
          <ChevronUp className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label={st.layerDown} onClick={ed.sendBackward}>
          <ChevronDown className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label={st.duplicate} onClick={ed.duplicateActive}>
          <Copy className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label={st.delete} onClick={ed.deleteActive}>
          <Trash2 className="h-4 w-4" />
        </ToolBtn>
        <Divider />
        <ToolBtn label="−" onClick={ed.zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="+" onClick={ed.zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </ToolBtn>
        <Divider />
        <ToolBtn label={st.export} onClick={exportPng}>
          <Download className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label={st.saveProject} onClick={saveProject}>
          <Save className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label={st.openProject} onClick={() => jsonRef.current?.click()}>
          <FolderOpen className="h-4 w-4" />
        </ToolBtn>
      </div>

      <div className="grid gap-0 lg:grid-cols-[240px_1fr_250px]">
        {/* left: add elements */}
        <div className="space-y-5 border-cream-300 p-4 lg:border-e">
          <button type="button" onClick={ed.addText} className="btn-primary w-full justify-center">
            <Type className="h-4 w-4" />
            {st.addText}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-outline w-full justify-center"
          >
            <Upload className="h-4 w-4" />
            {cp.uploadTab}
          </button>

          {/* AI generator */}
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-sage-700">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              {cp.aiTab}
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={2}
              placeholder={cp.aiPromptPlaceholder}
              className="w-full resize-none rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs outline-none focus:border-sage-400"
            />
            <button
              type="button"
              onClick={generateAi}
              disabled={aiLoading || !aiPrompt.trim()}
              className="btn-primary mt-2 w-full justify-center !py-2 text-xs disabled:opacity-60"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? cp.aiGenerating : cp.aiGenerate}
            </button>
            {aiError && <p className="mt-1.5 text-[11px] font-medium text-blossom-500">{aiError}</p>}
          </div>

          {ed.lowRes && (
            <p className="rounded-xl bg-gold-50 px-3 py-2 text-[11px] font-medium text-gold-600">
              ⚠️ {st.lowRes}
            </p>
          )}
        </div>

        {/* center: canvas */}
        <div className="flex flex-col items-center justify-start gap-3 bg-cream-100/50 p-4">
          <div
            ref={ed.containerRef}
            className="flex max-h-[34rem] w-full justify-center overflow-auto"
          >
            <div
              style={{ transform: `scale(${ed.zoom})`, transformOrigin: "top center" }}
              className="inline-block"
            >
              <canvas ref={ed.canvasElRef} />
            </div>
          </div>
          {!ed.ready && (
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" /> …
            </p>
          )}
        </div>

        {/* right: properties */}
        <div className="border-cream-300 p-4 lg:border-s">
          <p className="mb-3 text-sm font-bold text-sage-700">{st.properties}</p>
          {ed.selection.type === "none" ? (
            <p className="text-xs text-ink-soft">{st.selectHint}</p>
          ) : ed.selection.type === "text" ? (
            <TextProps st={st} selection={ed.selection} onChange={ed.updateText} />
          ) : (
            <ImageProps st={st} ed={ed} />
          )}
        </div>
      </div>

      {/* footer order */}
      <div className="border-t border-cream-300 bg-white p-4">
        <button type="button" onClick={orderWhatsApp} className="btn-whatsapp w-full">
          <MessageCircle className="h-4 w-4" />
          {cp.cta}
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-soft">{st.designReady}</p>
      </div>

      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={onUpload} />
      <input ref={jsonRef} type="file" accept="application/json,.json" className="hidden" onChange={openProject} />
    </div>
  );
}

/* ─────────────────── property panels ─────────────────── */

function TextProps({
  st,
  selection,
  onChange,
}: {
  st: Dictionary["studio"];
  selection: EditorSelection;
  onChange: (p: Partial<EditorSelection>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label={st.textContent}>
        <input
          value={selection.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-sage-400"
        />
      </Field>
      <Field label={st.font}>
        <select
          value={selection.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-sage-400"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`${st.size}: ${selection.fontSize}`}>
        <input
          type="range"
          min={10}
          max={120}
          value={selection.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="w-full accent-sage-600"
        />
      </Field>
      <Field label={st.align}>
        <div className="flex gap-1.5">
          {([["right", AlignRight], ["center", AlignCenter], ["left", AlignLeft]] as const).map(
            ([val, Icon]) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ textAlign: val })}
                className={cn(
                  "grid h-9 flex-1 place-items-center rounded-xl border transition",
                  selection.textAlign === val
                    ? "border-sage-500 bg-sage-50 text-sage-700"
                    : "border-cream-300 bg-white text-ink-soft",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ),
          )}
        </div>
      </Field>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange({ bold: !selection.bold })}
          className={cn(
            "grid h-9 flex-1 place-items-center rounded-xl border transition",
            selection.bold ? "border-sage-500 bg-sage-50 text-sage-700" : "border-cream-300 bg-white text-ink-soft",
          )}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange({ italic: !selection.italic })}
          className={cn(
            "grid h-9 flex-1 place-items-center rounded-xl border transition",
            selection.italic ? "border-sage-500 bg-sage-50 text-sage-700" : "border-cream-300 bg-white text-ink-soft",
          )}
        >
          <Italic className="h-4 w-4" />
        </button>
      </div>
      <Field label={st.color}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ fill: c })}
              aria-label={c}
              style={{ backgroundColor: c }}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition",
                selection.fill.toLowerCase() === c.toLowerCase()
                  ? "scale-110 border-sage-500"
                  : "border-cream-300",
              )}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}

function ImageProps({
  st,
  ed,
}: {
  st: Dictionary["studio"];
  ed: ReturnType<typeof useDesignEditor>;
}) {
  return (
    <div className="space-y-2 text-sm">
      <button type="button" onClick={ed.bringForward} className="btn-outline w-full justify-center !py-2 text-xs">
        <ChevronUp className="h-4 w-4" />
        {st.layerUp}
      </button>
      <button type="button" onClick={ed.sendBackward} className="btn-outline w-full justify-center !py-2 text-xs">
        <ChevronDown className="h-4 w-4" />
        {st.layerDown}
      </button>
      <button type="button" onClick={ed.duplicateActive} className="btn-outline w-full justify-center !py-2 text-xs">
        <Copy className="h-4 w-4" />
        {st.duplicate}
      </button>
      <button
        type="button"
        onClick={ed.deleteActive}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-cream-300 bg-white py-2 text-xs font-semibold text-blossom-500 transition hover:border-blossom-300"
      >
        <Trash2 className="h-4 w-4" />
        {st.delete}
      </button>
    </div>
  );
}

/* ─────────────────── tiny helpers ─────────────────── */

function ToolBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-sage-700 transition hover:bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-cream-300" />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
