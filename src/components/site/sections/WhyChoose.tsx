import { Droplets, Sparkles, Wind, LayoutGrid } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const features = [
  {
    icon: Droplets,
    title: "Deep Cleaning",
    text: "Helps remove everyday dirt, stains, and surface buildup.",
  },
  {
    icon: Sparkles,
    title: "Shines",
    text: "Leaves cleaned surfaces looking bright and refreshed.",
  },
  {
    icon: Wind,
    title: "Freshens",
    text: "Helps keep your surroundings clean and pleasant.",
  },
  {
    icon: LayoutGrid,
    title: "Multi-Surface Use",
    text: "Suitable for many common household and commercial cleaning needs.",
  },
];

export function WhyChoose() {
  return (
    <section id="benefits" className="scroll-mt-24 bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Why Choose DEAL CLEAN</h2>
          <p className="mt-4 text-muted-foreground">
            One concentrated formula built to handle the everyday cleaning your home, shop, or
            office needs.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Reveal as="li" key={f.title} className="card-premium p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                <f.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold uppercase tracking-wide text-secondary">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
