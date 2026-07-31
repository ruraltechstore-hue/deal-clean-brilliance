import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/sections/Hero";
import { Purchase } from "@/components/site/sections/Purchase";
import { About } from "@/components/site/sections/About";
import { WhyChoose } from "@/components/site/sections/WhyChoose";
import { Uses } from "@/components/site/sections/Uses";
import { HowToUse } from "@/components/site/sections/HowToUse";
import { BeforeAfter } from "@/components/site/sections/BeforeAfter";
import { Reviews } from "@/components/site/sections/Reviews";
import { Faq } from "@/components/site/sections/Faq";
import { Contact } from "@/components/site/sections/Contact";
import { product } from "@/lib/site-config";

const description =
  "Shop DEAL CLEAN 500 ml, a powerful all-in-one cleaning solution designed to clean, shine, and freshen multiple suitable surfaces.";

const productJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  brand: { "@type": "Brand", name: "DEAL Cleaning Products" },
  size: product.size,
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price: product.price,
    availability: product.available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  },
});

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "DEAL CLEAN 500 ml | All-in-One Cleaning Solution" },
      { name: "description", content: description },
      { property: "og:title", content: "DEAL CLEAN 500 ml | All-in-One Cleaning Solution" },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  return (
    <div className="min-h-dvh bg-background">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: productJsonLd }}
      />
      <Header />
      <main>
        <Hero />
        <Purchase />
        <About />
        <WhyChoose />
        <Uses />
        <HowToUse />
        <BeforeAfter />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
