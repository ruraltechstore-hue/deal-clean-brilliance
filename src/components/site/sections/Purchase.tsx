import { Link } from "@tanstack/react-router";
import { Check, Headphones, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatINR, products } from "@/lib/site-config";

const assurances = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: Truck, label: "Easy Ordering" },
  { icon: Headphones, label: "Fast Customer Support" },
];

export function Purchase() {
  const cart = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [zoomMap, setZoomMap] = useState<Record<string, boolean>>({});
  const [originMap, setOriginMap] = useState<Record<string, string>>({});

  const getQty = (id: string) => quantities[id] || 1;

  const setQty = (id: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  const addToCart = (product: typeof products[0]) => {
    const qty = getQty(product.id);
    cart.add(product.id, qty);
    toast.success(`Added ${qty} × ${product.name} (${product.size}) to your cart.`);
  };

  return (
    <section id="buy" className="bg-background py-16 sm:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 sm:px-6">
        {products.map((product) => {
          const qty = getQty(product.id);
          const zoom = zoomMap[product.id] || false;
          const origin = originMap[product.id] || "50% 50%";

          return (
            <div key={product.id} className="grid gap-12 lg:grid-cols-2">
              <div className="card-premium overflow-hidden bg-gradient-soft p-6">
                <div
                  className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-xl"
                  onMouseEnter={() => setZoomMap((prev) => ({ ...prev, [product.id]: true }))}
                  onMouseLeave={() => setZoomMap((prev) => ({ ...prev, [product.id]: false }))}
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setOriginMap((prev) => ({
                      ...prev,
                      [product.id]: `${((e.clientX - r.left) / r.width) * 100}% ${
                        ((e.clientY - r.top) / r.height) * 100
                      }%`,
                    }));
                  }}
                >
                  <img
                    src={product.imageUrl}
                    alt={`${product.name} ${product.size} bottle`}
                    loading="lazy"
                    width={520}
                    height={780}
                    style={{ transformOrigin: origin }}
                    className={`h-full w-full object-contain transition-transform duration-300 ${
                      zoom ? "scale-[1.9]" : "scale-100"
                    }`}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Hover or tap the image to zoom in on the label.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-extrabold sm:text-4xl">{product.name}</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {product.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
                    Product Size: {product.size}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      product.available
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {product.available ? "In Stock" : "Out of Stock"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="flex" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </span>
                  <span className="text-sm text-muted-foreground">Trusted by customers</span>
                </div>

                <p className="mt-6 font-display text-4xl font-extrabold text-secondary">
                  {formatINR(product.price)}
                  <span className="ml-2 align-middle text-sm font-medium text-muted-foreground">
                    per {product.size} bottle
                  </span>
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <div className="flex items-center rounded-full border border-border bg-card">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="grid h-11 w-11 place-items-center rounded-full hover:bg-accent"
                      onClick={() => setQty(product.id, qty - 1)}
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="w-10 text-center font-semibold" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="grid h-11 w-11 place-items-center rounded-full hover:bg-accent"
                      onClick={() => setQty(product.id, qty + 1)}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total: <span className="font-semibold text-foreground">{formatINR(qty * product.price)}</span>
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    className="rounded-full px-8"
                    onClick={() => addToCart(product)}
                    disabled={!product.available}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8"
                    disabled={!product.available}
                  >
                    <Link to="/checkout" onClick={() => addToCart(product)}>
                      Buy Now
                    </Link>
                  </Button>
                </div>

                <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                  {assurances.map((a) => (
                    <li key={a.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <a.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {a.label}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 flex items-start gap-2 rounded-xl bg-surface p-4 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  Sold and dispatched by SP Enterprises, Katedan, Hyderabad.
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
