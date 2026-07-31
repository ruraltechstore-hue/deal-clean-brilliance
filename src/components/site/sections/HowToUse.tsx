import { AlertTriangle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { usageInstructions } from "@/lib/site-config";

const steps = [
  {
    title: "Prepare the Surface",
    text: "Remove loose dust or dirt from the area.",
  },
  {
    title: "Mix or Apply",
    text: "Use DEAL CLEAN according to the recommended dilution or application instructions.",
  },
  {
    title: "Clean the Surface",
    text: "Use a suitable cloth, mop, sponge, or cleaning material.",
  },
  {
    title: "Wipe and Finish",
    text: "Wipe the surface and allow it to dry for a clean and refreshed finish.",
  },
];

export function HowToUse() {
  return (
    <section id="how-to-use" className="scroll-mt-24 bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">How to Use</h2>
          <p className="mt-4 text-muted-foreground">
            Four simple steps for a clean, refreshed finish.
          </p>
        </Reveal>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} className="card-premium relative p-6">
              <span className="font-display text-5xl font-extrabold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-bold text-secondary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Official usage instructions
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {usageInstructions}
            </p>
          </div>
          <div className="flex gap-3 rounded-2xl border border-primary/30 bg-accent p-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm font-medium leading-relaxed text-accent-foreground">
              Follow the product label instructions. Keep away from children. Avoid contact with
              eyes. Store safely.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
