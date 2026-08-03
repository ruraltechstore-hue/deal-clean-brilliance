import { Reveal } from "@/components/site/Reveal";
import { brand, products } from "@/lib/site-config";

export function About() {
  const primaryProduct = products[0];
  return (
    <section id="about" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">About us</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            A single bottle made for everyday Indian homes
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            {brand.name} is a cleaning brand from {brand.company}, based in {brand.address}. We keep
            our range deliberately simple: one high-performance liquid, {primaryProduct.size}, made to
            clean, shine, and freshen the surfaces you use every day — floors, tiles, kitchens,
            glass, steel, bathrooms, and more.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Instead of buying a different cleaner for every room, DEAL CLEAN gives you one
            all-in-one solution that is easy to store, easy to use, and easy to reorder.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { k: "1", v: "Product, zero confusion" },
              { k: "500 ml", v: "Ready-to-use bottle" },
              { k: "18+", v: "Common cleaning uses" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-2xl font-extrabold text-primary">{s.k}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="card-premium bg-gradient-soft p-8 text-center">
          <img
            src={brand.logoUrl}
            alt="DEAL Cleaning Products brand logo"
            loading="lazy"
            width={220}
            height={220}
            className="mx-auto h-40 w-auto object-contain"
          />
          <p className="mt-6 font-display text-lg font-bold text-secondary">
            {brand.company}
          </p>
          <p className="text-sm text-muted-foreground">{brand.address}</p>
        </Reveal>
      </div>
    </section>
  );
}
