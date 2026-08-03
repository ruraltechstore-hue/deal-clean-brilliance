import { Link, useRouterState } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { deliveryCharge, formatINR, products } from "@/lib/site-config";

export function CartSheet() {
  const cart = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const cartItems = Object.entries(cart.items)
    .map(([id, quantity]) => {
      const product = products.find((p) => p.id === id);
      return product ? { product, quantity } : null;
    })
    .filter((item): item is { product: typeof products[0]; quantity: number } => item !== null);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Open cart, ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`}
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          {totalQuantity > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
              {totalQuantity}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>DEAL CLEAN Store.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <Button asChild className="mt-4">
                <Link to="/" hash="buy">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          ) : (
            cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="card-premium flex gap-4 p-4">
                <img
                  src={product.imageUrl}
                  alt={`${product.name} ${product.size} bottle`}
                  loading="lazy"
                  className="h-24 w-16 shrink-0 rounded-lg object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.size} · {formatINR(product.price)}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
                        onClick={() => cart.setQuantity(product.id, quantity - 1)}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
                        onClick={() => cart.setQuantity(product.id, quantity + 1)}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(product.id)}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-4">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatINR(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium">
                {cartItems.length === 0 ? formatINR(0) : formatINR(cart.delivery)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold text-secondary">{formatINR(cart.total)}</dd>
            </div>
          </dl>
          <Button
            asChild
            size="lg"
            className="mt-4 w-full rounded-full"
            disabled={cartItems.length === 0}
          >
            <Link to="/checkout" search={pathname === "/checkout" ? undefined : undefined}>
              Proceed to Checkout
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
