import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import QRCode from "react-qr-code";
import { CreditCard, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart } from "@/lib/cart";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { paymentService } from "@/services/paymentService";
import { contact, deliveryCharge, formatINR, products } from "@/lib/site-config";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  address: z.string().trim().min(8, "Enter your complete delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Enter your state").max(60),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  transactionId: z.string().trim().min(5, "Enter a valid transaction ID"),
});

type Form = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Form, string>>;

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({
    meta: [
      { title: "Checkout | DEAL CLEAN Store" },
      {
        name: "description",
        content:
          "Complete your DEAL CLEAN order — enter your delivery details and confirm your purchase.",
      },
      { property: "og:title", content: "Checkout | DEAL CLEAN Store" },
      { property: "og:description", content: "Complete your DEAL CLEAN order." },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
});

function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Errors>({});
  const [paying, setPaying] = useState(false);

  const cartItems = Object.entries(cart.items)
    .map(([id, quantity]) => {
      const product = products.find((p) => p.id === id);
      return product ? { product, quantity } : null;
    })
    .filter((item): item is { product: typeof products[0]; quantity: number } => item !== null);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const readForm = (form: HTMLFormElement) => {
    const fd = new FormData(form);
    return schema.safeParse({
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      state: String(fd.get("state") ?? ""),
      pincode: String(fd.get("pincode") ?? ""),
      transactionId: String(fd.get("transactionId") ?? ""),
    });
  };

  const showErrors = (issues: z.ZodIssue[]) => {
    const next: Errors = {};
    issues.forEach((i) => {
      next[i.path[0] as keyof Errors] = i.message;
    });
    setErrors(next);
    toast.error("Please check the highlighted fields.");
  };

  const finishOrder = (
    orderId: string,
    data: Form,
    transactionId?: string,
  ) => {
    const summary = {
      orderId,
      items: cartItems.map((item) => ({ id: item.product.id, quantity: item.quantity })),
      totalQuantity,
      subtotal: cart.subtotal,
      delivery: cart.delivery,
      total: cart.total,
      customer: data,
      payment: { transaction_id: transactionId ?? data.transactionId },
    };
    try {
      sessionStorage.setItem("deal-clean-last-order", JSON.stringify(summary));
    } catch {
      /* ignore */
    }
    cart.remove();
    void navigate({ to: "/order-confirmed" });
  };

  const placeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (totalQuantity === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const parsed = readForm(e.currentTarget);
    if (!parsed.success) return showErrors(parsed.error.issues);
    setErrors({});
    const data = parsed.data;

    if (!isSupabaseConfigured) {
      finishOrder(`DC${Date.now().toString().slice(-8)}`, data);
      return;
    }

    setPaying(true);
    try {
      const order = await paymentService.createOrder({
        quantity: totalQuantity,
        transactionId: data.transactionId,
        customer: data,
      });

      finishOrder(order.order_number, data, data.transactionId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the order.");
    } finally {
      setPaying(false);
    }
  };

  const field = (
    id: keyof Form,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} className="mt-1.5" {...props} />
      {errors[id] && <p className="mt-1 text-xs text-destructive">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Delivering DEAL CLEAN products across India from Katedan, Hyderabad.
        </p>

        <form onSubmit={placeOrder} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="card-premium p-6 sm:p-8">
            <h2 className="text-xl font-bold">Delivery details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {field("name", "Customer Name", { autoComplete: "name" })}
              {field("phone", "Mobile Number", { inputMode: "tel", autoComplete: "tel" })}
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Complete Delivery Address</Label>
                <Textarea id="address" name="address" rows={3} className="mt-1.5" />
                {errors.address && (
                  <p className="mt-1 text-xs text-destructive">{errors.address}</p>
                )}
              </div>
              {field("city", "City", { autoComplete: "address-level2" })}
              {field("state", "State", { autoComplete: "address-level1" })}
              {field("pincode", "Pincode", { inputMode: "numeric", autoComplete: "postal-code" })}
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-accent p-5 text-sm text-accent-foreground">
              <p className="flex items-center gap-2 font-semibold">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Scan and Pay
              </p>
              <div className="mt-4 flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCode
                    value={`upi://pay?pa=SPENTERPRISES.eazypay2@icici&pn=S P ENTERPRISES&tr=EZYS6300137425&cu=INR&mc=7210&am=${cart.total}`}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="text-center text-muted-foreground">
                  Scan the QR code above to make your payment securely. Once paid, please enter the Transaction ID below to confirm your order.
                </p>
                <div className="w-full mt-2 text-left">
                  {field("transactionId", "Transaction ID / Reference No.", { placeholder: "e.g., T23120..." })}
                </div>
              </div>
            </div>
          </div>

          <aside className="card-premium h-fit p-6 sm:p-8">
            <h2 className="text-xl font-bold">Order summary</h2>

            {cartItems.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <Button asChild className="mt-4 rounded-full">
                  <Link to="/" hash="buy">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-5 space-y-4">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-4">
                      <img
                        src={product.imageUrl}
                        alt={`${product.name} ${product.size} bottle`}
                        loading="lazy"
                        className="h-24 w-16 rounded-lg object-contain"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.size} · {formatINR(product.price)}
                        </p>
                        <div className="mt-3 flex items-center rounded-full border border-border w-fit">
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
                      </div>
                    </div>
                  ))}
                </div>

                <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium">{formatINR(cart.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery charges</dt>
                    <dd className="font-medium">{formatINR(cart.delivery)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-bold text-secondary">{formatINR(cart.total)}</dd>
                  </div>
                </dl>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full rounded-full"
                  disabled={paying}
                >
                  {paying ? "Placing Order…" : "Place Order"}
                </Button>
              </>
            )}
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}
