export const locales = ["ar", "en", "he"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const rtlLocales: Locale[] = ["ar", "he"];

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export const localeMeta: Record<
  Locale,
  { label: string; nativeLabel: string; flag: string; htmlLang: string }
> = {
  ar: { label: "Arabic", nativeLabel: "العربية", flag: "🇸🇦", htmlLang: "ar" },
  en: { label: "English", nativeLabel: "English", flag: "🇬🇧", htmlLang: "en" },
  he: { label: "Hebrew", nativeLabel: "עברית", flag: "🇮🇱", htmlLang: "he" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
