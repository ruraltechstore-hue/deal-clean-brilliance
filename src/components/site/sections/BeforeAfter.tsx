import { Reveal } from "@/components/site/Reveal";
import baTile from "@/assets/ba-tile.jpg";
import baKitchen from "@/assets/ba-kitchen.jpg";
import baFloor from "@/assets/ba-floor.jpg";

/** Swap these image imports to use your own before/after photos. */
const results = [
  { src: baTile, title: "Tiles", text: "Dull, dusty tiles wiped down to a bright finish." },
  {
    src: baKitchen,
    title: "Kitchen Surfaces",
    text: "Everyday kitchen grime cleared from platforms and steel.",
  },
  { src: baFloor, title: "Floors", text: "Regular mopping leaves floors looking fresh." },
];

export function BeforeAfter() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Before and After</h2>
          <p className="mt-4 text-muted-foreground">
            Illustrative examples of everyday cleaning results. Actual results vary with surface
            type, condition, and cleaning method.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {results.map((r) => (
            <Reveal as="li" key={r.title} className="card-premium overflow-hidden">
              <img
                src={r.src}
                alt={`Before and after cleaning comparison: ${r.title}`}
                loading="lazy"
                width={1024}
                height={768}
                className="h-56 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold text-secondary">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
