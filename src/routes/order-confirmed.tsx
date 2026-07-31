import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { contact, formatINR, product } from "@/lib/site-config";

type Order = {
  orderId: string;
  quantity: number;
  subtotal: number;
  delivery: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
};

export const Route = createFileRoute("/order-confirmed")({
  component: OrderConfirmed,
  head: () => ({
    meta: [
      { title: "Order Confirmed | DEAL CLEAN 500 ml" },
      {
        name: "description",
        content: "Your DEAL CLEAN 500 ml order has been received by SP Enterprises, Hyderabad.",
      },
      { property: "og:title", content: "Order Confirmed | DEAL CLEAN" },
      { property: "og:description", content: "Your DEAL CLEAN order has been received." },
      { property: "og:url", content: "/order-confirmed" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/order-confirmed" }],
  }),
});

function OrderConfirmed() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("deal-clean-last-order");
      if (raw) setOrder(JSON.parse(raw) as Order);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-dvh bg-surface">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="card-premium p-8 text-center sm:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">Thank you for your order!</h1>
          <p className="mt-3 text-muted-foreground">
            Your order has been received. Our team will call you shortly to confirm delivery and
            payment.
          </p>

          {order ? (
            <div className="mx-auto mt-8 max-w-md rounded-2xl bg-surface p-6 text-left text-sm">
              <p className="font-display text-lg font-bold text-secondary">
                Order #{order.orderId}
              </p>
              <dl className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    {product.name} ({product.size}) × {order.quantity}
                  </dt>
                  <dd className="font-medium">{formatINR(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-medium">{formatINR(order.delivery)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-bold text-secondary">{formatINR(order.total)}</dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-border pt-4 text-muted-foreground">
                <p className="font-semibold text-foreground">{order.customer.name}</p>
                <p>{order.customer.phone}</p>
                <p>
                  {order.customer.address}, {order.customer.city}, {order.customer.state} -{" "}
                  {order.customer.pincode}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              No recent order details found in this browser session.
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-8">
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8">
              <a href={`tel:${(contact.phones[0] ?? "").replace(/\s/g, "")}`}>Contact Support</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
