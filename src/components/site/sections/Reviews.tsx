import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { sampleReviews } from "@/lib/site-config";

export function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-24 bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Customer Reviews</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Sample reviews shown for display purposes. Real customer reviews will appear here once
            the review system is connected.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sampleReviews.map((r) => (
            <Reveal as="li" key={r.name} className="card-premium flex flex-col p-6">
              <span className="inline-flex w-fit rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
                Sample review
              </span>
              <span className="mt-4 flex" aria-label={`${r.rating} out of 5 stars`}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className={
                      i < r.rating ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4 text-border"
                    }
                  />
                ))}
              </span>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">“{r.text}”</p>
              <p className="mt-5 text-sm font-semibold text-secondary">
                — {r.name}
                <span className="block text-xs font-normal text-muted-foreground">{r.city}</span>
              </p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Button
            variant="outline"
            className="rounded-full px-8"
            onClick={() =>
              toast("Review submission coming soon", {
                description: "Reviews will open once the review system is connected.",
              })
            }
          >
            Write a Review
          </Button>
        </div>
      </div>
    </section>
  );
}
