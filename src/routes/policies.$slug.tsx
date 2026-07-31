import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { brand, contact, deliveryCharge, formatINR } from "@/lib/site-config";

const policies: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: "Shipping Policy",
    body: [
      `Orders are dispatched by ${brand.company}, ${brand.address}, usually within 1–3 working days of order confirmation.`,
      `A delivery charge of ${formatINR(deliveryCharge)} applies per order. Delivery timelines depend on your location and the courier partner.`,
      "Our team will contact you on the phone number provided to confirm your delivery address before dispatch.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We collect only the details required to process and deliver your order: name, phone number, email address, and delivery address.",
      "Your details are never sold or shared for marketing purposes. They may be shared with courier partners solely to deliver your order.",
      `For any privacy request, contact us at ${contact.phones[0]}.`,
    ],
  },
  terms: {
    title: "Terms and Conditions",
    body: [
      "By placing an order on this website you agree to provide accurate contact and delivery information.",
      "DEAL CLEAN is a cleaning product for external surface use only. Always follow the instructions on the product label, keep away from children, and avoid contact with eyes.",
      "Product images are for illustration. Prices and delivery charges may change without prior notice.",
    ],
  },
  refund: {
    title: "Refund Policy",
    body: [
      "If your bottle arrives damaged or leaking, contact us within 48 hours of delivery with photographs and we will arrange a replacement or refund.",
      "Opened or used bottles cannot be returned for hygiene and safety reasons.",
      `Approved refunds are processed to the original payment method within 7 working days. For assistance, call ${contact.phones[0]}.`,
    ],
  },
};

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => {
    const policy = policies[params.slug];
    if (!policy) throw notFound();
    return { policy };
  },
  head: ({ params, loaderData }) => {
    const title = loaderData?.policy.title ?? "Policy";
    return {
      meta: [
        { title: `${title} | DEAL Cleaning Products` },
        {
          name: "description",
          content: `${title} for DEAL CLEAN 500 ml orders placed with SP Enterprises, Katedan, Hyderabad.`,
        },
        { property: "og:title", content: `${title} | DEAL Cleaning Products` },
        {
          property: "og:description",
          content: `${title} for DEAL CLEAN 500 ml orders.`,
        },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/policies/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/policies/${params.slug}` }],
    };
  },
  component: PolicyPage,
});

function PolicyPage() {
  const { policy } = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{policy.title}</h1>
        <div className="mt-8 space-y-5">
          {policy.body.map((p) => (
            <p key={p} className="leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
