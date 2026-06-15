import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Build a wa.me deep link with a prefilled message. */
export function whatsappLink(message: string): string {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "972509011449";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(value: number, currency = "₪"): string {
  return `${value.toLocaleString("en-US")} ${currency}`;
}

export const INSTAGRAM_HANDLE =
  process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "malak_zaror_cadeaux";
