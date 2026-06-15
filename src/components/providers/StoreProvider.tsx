"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/types";

export interface CartLine {
  product: Product;
  quantity: number;
  variantId?: string;
}

interface StoreState {
  cart: CartLine[];
  wishlist: string[]; // product ids
  addToCart: (product: Product, variantId?: string) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
}

const StoreContext = createContext<StoreState | null>(null);

const CART_KEY = "almalak.cart";
const WISH_KEY = "almalak.wishlist";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      const w = localStorage.getItem(WISH_KEY);
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((product: Product, variantId?: string) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (l) => l.product.id === product.id && l.variantId === variantId,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1, variantId }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((l) => l.product.id !== productId));
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const value = useMemo<StoreState>(() => {
    const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
    const cartTotal = cart.reduce(
      (sum, l) => sum + l.product.price * l.quantity,
      0,
    );
    return {
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      cartCount,
      cartTotal,
      wishlistCount: wishlist.length,
    };
  }, [cart, wishlist, addToCart, removeFromCart, toggleWishlist]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
