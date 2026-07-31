import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, MessageCircle, Minus, Plus } from "lucide-react";
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
import { contact, deliveryCharge, formatINR, product } from "@/lib/site-config";

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
});

type Form = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Form, string>>;

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({
    meta: [
      { title: "Checkout | DEAL CLEAN 500 ml" },
      {
        name: "description",
        content:
          "Complete your DEAL CLEAN 500 ml order — enter your delivery details and confirm your purchase.",
      },
      { property: "og:title", content: "Checkout | DEAL CLEAN 500 ml" },
      { property: "og:description", content: "Complete your DEAL CLEAN 500 ml order." },
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
    payment?: { razorpay_payment_id: string; razorpay_order_id: string },
  ) => {
    const summary = {
      orderId,
      quantity: cart.quantity,
      subtotal: cart.subtotal,
      delivery: cart.delivery,
      total: cart.total,
      customer: data,
      payment: payment ?? null,
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
    if (cart.quantity === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const parsed = readForm(e.currentTarget);
    if (!parsed.success) return showErrors(parsed.error.issues);
    setErrors({});
    const data = parsed.data;

    // Without Supabase configured, fall back to a manual (offline) confirmation.
    if (!isSupabaseConfigured) {
      finishOrder(`DC${Date.now().toString().slice(-8)}`, data);
      return;
    }

    setPaying(true);
    try {
      await paymentService.loadCheckout();
      const order = await paymentService.createOrder({
        quantity: cart.quantity,
        customer: data,
      });

      const Razorpay = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } })
        .Razorpay;
      const rzp = new Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: "SP Enterprises",
        description: `${product.name} (${product.size}) x ${cart.quantity}`,
        prefill: { name: data.name, email: data.email, contact: data.phone },
        notes: { order_number: order.order_number },
        theme: { color: "#E31B72" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentService.verifyPayment(response);
            finishOrder(order.order_number, data, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
            });
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Payment verification failed.",
            );
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the payment.");
    } finally {
      setPaying(false);
    }
  };

  const orderOnWhatsApp = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    if (cart.quantity === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const parsed = readForm(form);
    if (!parsed.success) return showErrors(parsed.error.issues);
    const d = parsed.data;
    const text = `Hello SP Enterprises, I would like to order:%0A%0A${product.name} (${product.size}) x ${cart.quantity}%0ASubtotal: ${formatINR(cart.subtotal)}%0ADelivery: ${formatINR(cart.delivery)}%0ATotal: ${formatINR(cart.total)}%0A%0AName: ${d.name}%0APhone: ${d.phone}%0AEmail: ${d.email}%0AAddress: ${d.address}, ${d.city}, ${d.state} - ${d.pincode}`;
    window.open(`https://wa.me/${contact.whatsapp}?text=${text}`, "_blank", "noopener");
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
          Delivering DEAL CLEAN {product.size} across India from Katedan, Hyderabad.
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
                {isSupabaseConfigured
                  ? "Secure payment by Razorpay"
                  : "Razorpay activates once Supabase is connected."}
              </p>
              <p className="mt-1 text-muted-foreground">
                {isSupabaseConfigured
                  ? "Your payment is verified on our server before the order is confirmed."
                  : "Until then, orders are confirmed manually by our team over phone or WhatsApp."}
              </p>
            </div>
          </div>

          <aside className="card-premium h-fit p-6 sm:p-8">
            <h2 className="text-xl font-bold">Order summary</h2>

            {cart.quantity === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <Button asChild className="mt-4 rounded-full">
                  <Link to="/" hash="buy">
                    Back to product
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-5 flex gap-4">
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
                        onClick={() => cart.setQuantity(cart.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{cart.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
                        onClick={() => cart.setQuantity(cart.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium">{formatINR(cart.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Delivery charges</dt>
                    <dd className="font-medium">{formatINR(deliveryCharge)}</dd>
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
                  {paying ? "Opening payment…" : isSupabaseConfigured ? "Pay & Place Order" : "Place Order"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="mt-3 w-full rounded-full"
                  onClick={orderOnWhatsApp}
                >
                  <MessageCircle className="mr-1 h-4 w-4" aria-hidden="true" />
                  Order through WhatsApp
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
