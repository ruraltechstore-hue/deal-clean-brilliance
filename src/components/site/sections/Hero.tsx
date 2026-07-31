import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { product } from "@/lib/site-config";

const highlights = [
  "Cleans Deeply",
  "Leaves Surfaces Shining",
  "Freshens Your Space",
  "Suitable for Multiple Surfaces",
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-soft">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:gap-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary shadow-soft">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            First Time In India
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            One Liquid. <span className="text-gradient-brand">Spotless Results.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Powerful all-in-one cleaning for your home, kitchen, floors, tiles, bathrooms, and more.
          </p>

          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm font-medium">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/" hash="buy">
                Buy 500 ml Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link to="/" hash="about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        <div className="bottle-glow relative flex justify-center">
          <img
            src={product.imageUrl}
            alt="DEAL CLEAN All in One 500 ml bottle with pink cleaning liquid"
            width={520}
            height={780}
            className="relative z-10 h-[380px] w-auto object-contain drop-shadow-2xl sm:h-[480px] lg:h-[560px]"
          />
          <div className="absolute right-2 top-6 z-20 rounded-2xl border border-border bg-card/90 px-4 py-3 text-center shadow-lift backdrop-blur sm:right-8">
            <p className="font-display text-2xl font-extrabold text-primary">500 ml</p>
            <p className="mt-1 max-w-[9rem] text-[10px] font-semibold uppercase leading-tight tracking-widest text-muted-foreground">
              All-in-One Cleaning Solution
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
