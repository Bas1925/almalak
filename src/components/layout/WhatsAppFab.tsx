import { MessageCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { whatsappLink } from "@/lib/utils";

const MESSAGES: Record<Locale, string> = {
  ar: "مرحباً الملاك 👋 أود الاستفسار عن طلب",
  en: "Hello Al Malak 👋 I'd like to ask about an order",
  he: "שלום אל מלאכ 👋 אשמח לקבל פרטים על הזמנה",
};

export function WhatsAppFab({ locale }: { locale: Locale }) {
  return (
    <a
      href={whatsappLink(MESSAGES[locale])}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 end-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-card transition hover:scale-105 hover:bg-[#1eb858]"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle className="relative h-7 w-7" />
    </a>
  );
}
