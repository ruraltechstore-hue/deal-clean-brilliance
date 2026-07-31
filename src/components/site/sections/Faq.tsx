import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/site/Reveal";

const faqs = [
  {
    q: "What is the size of the product?",
    a: "DEAL CLEAN is currently available on this website in a 500 ml bottle.",
  },
  {
    q: "What can DEAL CLEAN be used for?",
    a: "It is designed for a variety of common cleaning applications, including floors, tiles, kitchens, bathrooms, and other suitable surfaces.",
  },
  {
    q: "How should I use the product?",
    a: "Follow the instructions provided on the product label and the official usage guidance.",
  },
  {
    q: "Is the product available in other sizes?",
    a: "Currently, this website sells only the 500 ml bottle.",
  },
  {
    q: "How can I place an order?",
    a: "Add the product to your cart and complete the checkout process, or call us for assistance.",
  },
];

export function Faq() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Frequently Asked Questions</h2>
        </Reveal>
        <Reveal className="mt-10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-semibold hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
