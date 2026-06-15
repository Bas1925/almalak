import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin, Instagram, MessageCircle } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { categories } from "@/lib/categories";
import { whatsappLink, INSTAGRAM_HANDLE } from "@/lib/utils";

export function Footer({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const phone = "+972 50-901-1449";
  const quickLinks = [
    { href: `/${locale}#categories`, label: dict.nav.products },
    { href: `/${locale}#best-sellers`, label: dict.nav.offers },
    { href: `/${locale}#custom`, label: dict.nav.customize },
    { href: `/${locale}#about`, label: dict.nav.about },
  ];
  const policies = [
    { slug: "privacy", label: dict.footer.policies.privacy },
    { slug: "returns", label: dict.footer.policies.returns },
    { slug: "shipping", label: dict.footer.policies.shipping },
    { slug: "faq", label: dict.footer.policies.faq },
  ];

  return (
    <footer id="footer" className="bg-sage-800 text-cream-200">
      <div className="container-px grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo.jpeg"
              alt={dict.brand.name}
              width={52}
              height={52}
              className="h-13 w-13 rounded-full object-cover ring-2 ring-gold-300/50"
              style={{ height: 52, width: 52 }}
            />
            <div>
              <p className="font-display text-lg font-bold text-white">
                {dict.brand.name}
              </p>
              <p className="text-xs text-blossom-200">{dict.brand.tagline}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cream-300/80">
            {dict.footer.tagline}
          </p>
          <div className="mt-5 flex gap-2">
            <Social href={`https://instagram.com/${INSTAGRAM_HANDLE}`}>
              <Instagram className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} />
            </Social>
            <Social href={whatsappLink("👋")}>
              <MessageCircle className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} />
            </Social>
          </div>
        </div>

        {/* quick links */}
        <div>
          <h3 className="font-display text-base font-bold text-white">
            {dict.footer.quickLinksTitle}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            {policies.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${locale}/policies/${p.slug}`}
                  className="transition hover:text-white"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* categories */}
        <div>
          <h3 className="font-display text-base font-bold text-white">
            {dict.footer.categoriesTitle}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${locale}/category/${c.slug}`}
                  className="transition hover:text-white"
                >
                  {dict.categories.items[c.slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contact */}
        <div>
          <h3 className="font-display text-base font-bold text-white">
            {dict.footer.contactTitle}
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-gold-300" />
              <a href={`tel:${phone.replace(/[\s-]/g, "")}`} dir="ltr">
                {phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <span>{dict.footer.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream-300/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {dict.brand.name}. {dict.footer.rights}.
          </p>
          <p>Kafr Manda · {phone}</p>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-cream-100 transition hover:bg-blossom-400 hover:text-white"
    >
      {children}
    </a>
  );
}
