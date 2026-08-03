import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { deliveryCharge, products } from "@/lib/site-config";

const STORAGE_KEY = "deal-clean-cart-v1";

type CartState = {
  items: Record<string, number>;
  add: (productId: string, qty?: number) => void;
  setQuantity: (productId: string, qty: number) => void;
  remove: (productId?: string) => void;
  subtotal: number;
  delivery: number;
  total: number;
  hydrated: boolean;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: Record<string, number> };
        if (parsed.items) {
          const validItems: Record<string, number> = {};
          for (const [id, qty] of Object.entries(parsed.items)) {
            if (typeof qty === "number" && qty > 0) {
              validItems[id] = Math.floor(qty);
            }
          }
          setItems(validItems);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const value = useMemo<CartState>(() => {
    let subtotal = 0;
    let totalItems = 0;
    
    for (const [id, qty] of Object.entries(items)) {
      const p = products.find((x) => x.id === id);
      if (p) {
        subtotal += qty * p.price;
        totalItems += qty;
      }
    }

    const delivery = totalItems > 0 ? deliveryCharge : 0;
    
    return {
      items,
      hydrated,
      add: (productId: string, qty = 1) => 
        setItems((prev) => ({
          ...prev,
          [productId]: Math.min(99, (prev[productId] || 0) + qty),
        })),
      setQuantity: (productId: string, qty: number) => 
        setItems((prev) => {
          const next = { ...prev };
          const validQty = Math.max(0, Math.min(99, Math.floor(qty)));
          if (validQty === 0) {
            delete next[productId];
          } else {
            next[productId] = validQty;
          }
          return next;
        }),
      remove: (productId?: string) => {
        if (productId) {
          setItems((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
        } else {
          setItems({}); // Clear entire cart
        }
      },
      subtotal,
      delivery,
      total: subtotal + delivery,
    };
  }, [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
