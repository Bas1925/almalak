"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Search,
  X,
  Upload,
  Loader2,
  PackageSearch,
  ExternalLink,
  Star,
  Palette,
} from "lucide-react";
import Link from "next/link";
import type { Product, CategorySlug } from "@/types";
import type { Locale } from "@/i18n/config";
import { formatPrice, cn } from "@/lib/utils";
import {
  STUDIO_PRODUCTS,
  type StudioAdminItem,
} from "@/components/studio/studio-products";

const STUDIO_MOCKUPS: Record<string, string> = Object.fromEntries(
  STUDIO_PRODUCTS.map((p) => [p.id, p.mockup]),
);

interface CatOption {
  slug: CategorySlug;
  name: string;
}

interface Props {
  initialProducts: Product[];
  initialStudio: StudioAdminItem[];
  categories: CatOption[];
  locale: Locale;
  currency: string;
}

/** Resize an image file in the browser to a web-friendly JPEG data URL. */
function resizeImage(file: File, maxW = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no-canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptyForm = (): FormState => ({
  id: null,
  nameAr: "",
  nameEn: "",
  nameHe: "",
  category: "natural-flowers",
  price: "",
  compareAt: "",
  rating: "0",
  reviewCount: "0",
  bestSeller: false,
  isNew: false,
  inStock: true,
  image: "",
});

interface FormState {
  id: string | null;
  nameAr: string;
  nameEn: string;
  nameHe: string;
  category: CategorySlug;
  price: string;
  compareAt: string;
  rating: string;
  reviewCount: string;
  bestSeller: boolean;
  isNew: boolean;
  inStock: boolean;
  image: string;
}

export function AdminDashboard({
  initialProducts,
  initialStudio,
  categories,
  locale,
  currency,
}: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<CategorySlug | "all" | "bestsellers">("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [studio, setStudio] = useState<StudioAdminItem[]>(initialStudio);
  const [studioDraft, setStudioDraft] = useState<StudioAdminItem[] | null>(null);
  const [savingStudio, setSavingStudio] = useState(false);

  function openStudio() {
    setStudioDraft(studio.map((s) => ({ ...s, name: { ...s.name } })));
  }

  function updateStudioDraft(
    id: string,
    patch: Partial<Omit<StudioAdminItem, "id" | "name">> & { name?: Partial<StudioAdminItem["name"]> },
  ) {
    setStudioDraft((d) =>
      d
        ? d.map((s) =>
            s.id === id
              ? { ...s, ...patch, name: { ...s.name, ...(patch.name ?? {}) } }
              : s,
          )
        : d,
    );
  }

  async function saveStudio() {
    if (!studioDraft) return;
    for (const s of studioDraft) {
      if (!s.name.ar.trim()) {
        alert("الاسم بالعربية مطلوب لكل منتج تصميم");
        return;
      }
      if (!(Number(s.price) > 0)) {
        alert("أدخل سعراً صحيحاً لكل منتج تصميم");
        return;
      }
    }
    setSavingStudio(true);
    try {
      const res = await fetch("/api/admin/studio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: studioDraft.map((s) => ({
            id: s.id,
            price: Number(s.price),
            name: s.name,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) setStudio(data.items);
        setStudioDraft(null);
        router.refresh();
      } else {
        alert("تعذّر حفظ منتجات التصميم");
      }
    } finally {
      setSavingStudio(false);
    }
  }

  const catName = useCallback(
    (slug: CategorySlug) => categories.find((c) => c.slug === slug)?.name ?? slug,
    [categories],
  );

  async function reload() {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
    router.refresh();
  }

  function openCreate() {
    setForm(emptyForm());
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      nameAr: p.name.ar,
      nameEn: p.name.en,
      nameHe: p.name.he,
      category: p.category,
      price: String(p.price),
      compareAt: p.compareAt ? String(p.compareAt) : "",
      rating: String(p.rating),
      reviewCount: String(p.reviewCount),
      bestSeller: !!p.badges?.includes("bestSeller"),
      isNew: !!p.badges?.includes("new"),
      inStock: p.inStock,
      image: p.image,
    });
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (res.ok) setForm((f) => (f ? { ...f, image: data.url } : f));
      else alert("تعذّر رفع الصورة");
    } catch {
      alert("تعذّر معالجة الصورة");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    if (!form) return;
    if (!form.nameAr.trim() || !form.price || !form.image) {
      alert("الاسم بالعربية والسعر والصورة حقول مطلوبة");
      return;
    }
    setSaving(true);
    const badges: string[] = [];
    if (form.bestSeller) badges.push("bestSeller");
    if (form.isNew) badges.push("new");
    const payload = {
      name: { ar: form.nameAr, en: form.nameEn, he: form.nameHe },
      category: form.category,
      price: Number(form.price),
      compareAt: form.compareAt ? Number(form.compareAt) : 0,
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      badges,
      inStock: form.inStock,
      image: form.image,
    };
    try {
      const res = form.id
        ? await fetch(`/api/admin/products/${form.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (res.ok) {
        setForm(null);
        await reload();
      } else {
        alert("تعذّر الحفظ — تأكد من الحقول");
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Product) {
    if (!confirm(`حذف "${p.name.ar}"؟`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) await reload();
    else alert("تعذّر الحذف");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const matchesSearch = (p: Product) =>
    !query.trim() ||
    p.name.ar.includes(query) ||
    p.name.en.toLowerCase().includes(query.toLowerCase()) ||
    catName(p.category).includes(query);

  const bySearch = products.filter(matchesSearch);
  const bestSellerCount = bySearch.filter((p) => p.badges?.includes("bestSeller")).length;
  const visible =
    activeCat === "all"
      ? bySearch
      : activeCat === "bestsellers"
        ? bySearch.filter((p) => p.badges?.includes("bestSeller"))
        : bySearch.filter((p) => p.category === activeCat);

  const renderRow = (p: Product) => (
    <div key={p.id} className="card flex items-center gap-3 p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-100">
        <Image src={p.image} alt={p.name.ar} fill sizes="56px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{p.name.ar}</p>
        <p className="truncate text-xs text-ink-soft">
          {catName(p.category)}
          {!p.inStock && <span className="text-blossom-500"> · غير متوفر</span>}
          {p.badges?.includes("bestSeller") && <span className="text-sage-600"> · الأكثر مبيعاً</span>}
          {p.badges?.includes("new") && <span className="text-blossom-500"> · جديد</span>}
        </p>
      </div>
      <div className="text-end">
        <p className="font-display text-base font-bold text-sage-700">
          {formatPrice(p.price, currency)}
        </p>
        {p.compareAt && (
          <p className="text-xs text-ink-faint line-through">
            {formatPrice(p.compareAt, currency)}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => openEdit(p)}
          aria-label="تعديل"
          className="grid h-9 w-9 place-items-center rounded-full text-sage-700 transition hover:bg-sage-50"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => remove(p)}
          aria-label="حذف"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-faint transition hover:bg-blossom-50 hover:text-blossom-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-cream-300 bg-cream-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <h1 className="font-display text-xl font-bold text-sage-800">لوحة التحكم</h1>
            <p className="text-xs text-ink-soft">إدارة منتجات الملاك</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-2 text-xs font-medium text-sage-700 transition hover:border-sage-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              عرض الموقع
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-3 py-2 text-xs font-medium text-ink-soft transition hover:text-blossom-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-full border border-cream-300 bg-white px-4 py-2.5 sm:w-72">
            <Search className="h-4 w-4 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={openStudio} className="btn-outline">
              <Palette className="h-4 w-4" />
              صمّم هديتك الشخصية
            </button>
            <button type="button" onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              إضافة منتج
            </button>
          </div>
        </div>

        {/* category filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Chip
            label="الكل"
            count={bySearch.length}
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
          />
          <Chip
            label="الأكثر مبيعاً"
            count={bestSellerCount}
            active={activeCat === "bestsellers"}
            onClick={() => setActiveCat("bestsellers")}
            tone="gold"
            icon={<Star className="h-3 w-3" />}
          />
          {categories.map((c) => (
            <Chip
              key={c.slug}
              label={c.name}
              count={bySearch.filter((p) => p.category === c.slug).length}
              active={activeCat === c.slug}
              onClick={() => setActiveCat(c.slug)}
            />
          ))}
        </div>

        {/* list */}
        {visible.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-16 text-center">
            <PackageSearch className="h-10 w-10 text-sage-300" />
            <p className="text-ink-soft">لا توجد منتجات مطابقة</p>
          </div>
        ) : activeCat === "all" ? (
          <div className="space-y-8">
            {categories.map((c) => {
              const items = bySearch.filter((p) => p.category === c.slug);
              if (!items.length) return null;
              return (
                <section key={c.slug}>
                  <div className="mb-2.5 flex items-center gap-2 border-b border-cream-300 pb-2">
                    <h2 className="font-display text-lg font-bold text-sage-800">{c.name}</h2>
                    <span className="rounded-full bg-sage-100 px-2 py-0.5 text-xs font-semibold text-sage-700">
                      {items.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">{items.map(renderRow)}</div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5">{visible.map(renderRow)}</div>
        )}
      </main>

      {/* form modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setForm(null)} />
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream-50 p-6 shadow-card sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-sage-800">
                {form.id ? "تعديل منتج" : "إضافة منتج"}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-full p-1.5 text-ink-soft transition hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* image */}
              <div>
                <Label>صورة المنتج *</Label>
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-cream-300 bg-cream-100">
                    {form.image ? (
                      <Image src={form.image} alt="" fill sizes="80px" className="object-cover" unoptimized />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-ink-faint">
                        <Upload className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-sage-300 bg-white px-4 py-2 text-sm font-medium text-sage-700 transition hover:border-sage-500">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "جارٍ الرفع..." : "اختر صورة"}
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} disabled={uploading} />
                  </label>
                </div>
              </div>

              <Field label="الاسم (عربي) *">
                <input className={inputCls} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name (English)">
                  <input dir="ltr" className={inputCls} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
                </Field>
                <Field label="שם (עברית)">
                  <input className={inputCls} value={form.nameHe} onChange={(e) => setForm({ ...form, nameHe: e.target.value })} />
                </Field>
              </div>

              <Field label="الفئة *">
                <select
                  className={inputCls}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as CategorySlug })}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="السعر (₪) *">
                  <input type="number" inputMode="decimal" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </Field>
                <Field label="السعر قبل الخصم">
                  <input type="number" inputMode="decimal" className={inputCls} value={form.compareAt} onChange={(e) => setForm({ ...form, compareAt: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="التقييم (0–5)">
                  <input type="number" step="0.1" min="0" max="5" className={inputCls} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                </Field>
                <Field label="عدد التقييمات">
                  <input type="number" className={inputCls} value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: e.target.value })} />
                </Field>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <Check label="الأكثر مبيعاً" checked={form.bestSeller} onChange={(v) => setForm({ ...form, bestSeller: v })} />
                <Check label="جديد" checked={form.isNew} onChange={(v) => setForm({ ...form, isNew: v })} />
                <Check label="متوفر" checked={form.inStock} onChange={(v) => setForm({ ...form, inStock: v })} />
              </div>
              <p className="-mt-1 text-[11px] text-ink-soft">
                ⭐ «الأكثر مبيعاً» يعرض المنتج في قسم «الأكثر طلباً» بالصفحة الرئيسية.
              </p>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={save} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {form.id ? "حفظ التعديلات" : "إضافة المنتج"}
                </button>
                <button type="button" onClick={() => setForm(null)} className="btn-outline">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* design studio products modal */}
      {studioDraft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setStudioDraft(null)} />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-cream-50 p-6 shadow-card sm:rounded-3xl">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-sage-800">
                <Palette className="h-5 w-5 text-sage-600" />
                صمّم هديتك الشخصية
              </h2>
              <button
                type="button"
                onClick={() => setStudioDraft(null)}
                className="rounded-full p-1.5 text-ink-soft transition hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-xs text-ink-soft">
              عدّل أسماء وأسعار المنتجات القابلة للطباعة في قسم «صمّم هديتك». الاسم بالعربية والسعر مطلوبان.
            </p>

            <div className="space-y-4">
              {studioDraft.map((s) => (
                <div key={s.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-cream-300 bg-[#15130f]">
                    <Image
                      src={STUDIO_MOCKUPS[s.id]}
                      alt={s.name.ar}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <Field label="الاسم (عربي) *">
                      <input
                        className={inputCls}
                        value={s.name.ar}
                        onChange={(e) => updateStudioDraft(s.id, { name: { ar: e.target.value } })}
                      />
                    </Field>
                    <Field label="السعر (₪) *">
                      <input
                        type="number"
                        inputMode="decimal"
                        className={inputCls}
                        value={s.price}
                        onChange={(e) =>
                          updateStudioDraft(s.id, { price: Number(e.target.value) })
                        }
                      />
                    </Field>
                    <Field label="Name (English)">
                      <input
                        dir="ltr"
                        className={inputCls}
                        value={s.name.en}
                        onChange={(e) => updateStudioDraft(s.id, { name: { en: e.target.value } })}
                      />
                    </Field>
                    <Field label="שם (עברית)">
                      <input
                        className={inputCls}
                        value={s.name.he}
                        onChange={(e) => updateStudioDraft(s.id, { name: { he: e.target.value } })}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={saveStudio}
                disabled={savingStudio}
                className="btn-primary flex-1 justify-center disabled:opacity-60"
              >
                {savingStudio ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                حفظ التعديلات
              </button>
              <button type="button" onClick={() => setStudioDraft(null)} className="btn-outline">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-sage-400 focus:ring-2 focus:ring-sage-100";

function Chip({
  label,
  count,
  active,
  onClick,
  tone = "sage",
  icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "sage" | "gold";
  icon?: React.ReactNode;
}) {
  const activeCls =
    tone === "gold"
      ? "border-gold-400 bg-gold-400 text-white"
      : "border-sage-500 bg-sage-500 text-white";
  const idleCls =
    tone === "gold"
      ? "border-gold-200 bg-gold-50 text-gold-500 hover:border-gold-400"
      : "border-cream-300 bg-white text-sage-700 hover:border-sage-400";
  const countCls = active
    ? "bg-white/25 text-white"
    : tone === "gold"
      ? "bg-gold-100 text-gold-500"
      : "bg-sage-100 text-sage-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active ? activeCls : idleCls,
      )}
    >
      {icon}
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px]", countCls)}>{count}</span>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-sage-700">{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn("h-4 w-4 rounded border-cream-300 text-sage-600 accent-sage-600")}
      />
      {label}
    </label>
  );
}
