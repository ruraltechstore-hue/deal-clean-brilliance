import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { deliveryCharge, product } from "@/lib/site-config";

const STORAGE_KEY = "deal-clean-cart-v1";

type CartState = {
  quantity: number;
  add: (qty?: number) => void;
  setQuantity: (qty: number) => void;
  remove: () => void;
  subtotal: number;
  delivery: number;
  total: number;
  hydrated: boolean;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [quantity, setQty] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { quantity?: number };
        if (typeof parsed.quantity === "number") setQty(Math.max(0, Math.floor(parsed.quantity)));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ quantity }));
    } catch {
      /* ignore */
    }
  }, [quantity, hydrated]);

  const value = useMemo<CartState>(() => {
    const subtotal = quantity * product.price;
    const delivery = quantity > 0 ? deliveryCharge : 0;
    return {
      quantity,
      hydrated,
      add: (qty = 1) => setQty((q) => Math.min(99, q + qty)),
      setQuantity: (qty: number) => setQty(Math.max(0, Math.min(99, Math.floor(qty)))),
      remove: () => setQty(0),
      subtotal,
      delivery,
      total: subtotal + delivery,
    };
  }, [quantity, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
