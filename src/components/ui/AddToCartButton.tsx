"use client";

import { useRef, useState } from "react";
import { ShoppingBag, Plus, Check } from "lucide-react";
import type { Product } from "@/types";
import { useStore } from "@/components/providers/StoreProvider";
import { cn } from "@/lib/utils";

/**
 * Add-to-cart button with tactile feedback: on click it pops, swaps to a
 * checkmark + "Added" for ~1.3s, then reverts. Re-clicking replays the pop.
 */
export function AddToCartButton({
  product,
  label,
  addedLabel,
  className,
  icon = "bag",
  variantId,
}: {
  product: Product;
  label: string;
  addedLabel: string;
  className?: string;
  icon?: "bag" | "plus";
  variantId?: string;
}) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const [pulse, setPulse] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick() {
    addToCart(product, variantId);
    setAdded(true);
    setPulse((p) => p + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1300);
  }

  const Icon = icon === "plus" ? Plus : ShoppingBag;
  const iconSize = icon === "plus" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-live="polite"
      className={cn(
        "transition-colors duration-300 active:scale-95",
        added && "!bg-sage-600",
        className,
      )}
    >
      <span
        key={pulse}
        className={cn(
          "inline-flex items-center gap-1.5",
          pulse > 0 && "animate-pop",
        )}
      >
        {added ? (
          <Check className={iconSize} />
        ) : (
          <Icon className={iconSize} />
        )}
        {added ? addedLabel : label}
      </span>
    </button>
  );
}
