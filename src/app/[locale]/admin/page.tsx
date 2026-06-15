import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { categories } from "@/lib/categories";
import { isAuthed } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/server/catalog";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة التحكم — الملاك",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";

  if (!isAuthed()) {
    return <AdminLogin />;
  }

  const dict = await getDictionary(locale);
  const products = await getAllProducts();
  const cats = categories.map((c) => ({
    slug: c.slug,
    name: dict.categories.items[c.slug],
  }));

  return (
    <AdminDashboard
      initialProducts={products}
      categories={cats}
      locale={locale}
      currency={dict.product.currency}
    />
  );
}
