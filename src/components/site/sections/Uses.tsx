import {
  Armchair,
  Bath,
  Building2,
  Car,
  CookingPot,
  Grid2x2,
  Hotel,
  Laptop,
  LayoutGrid,
  Smartphone,
  Sparkles,
  SprayCan,
  Stethoscope,
  ToggleLeft,
  Trees,
  Truck,
  Wine,
  Briefcase,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const uses = [
  { icon: LayoutGrid, label: "Floor Cleaning" },
  { icon: Grid2x2, label: "Tile Cleaning" },
  { icon: Wine, label: "Glass Cleaning" },
  { icon: CookingPot, label: "Kitchen Cleaning" },
  { icon: SprayCan, label: "Steel Cleaning" },
  { icon: Armchair, label: "Carpet Cleaning" },
  { icon: Trees, label: "Wood Cleaning" },
  { icon: Bath, label: "Bathroom Cleaning" },
  { icon: Building2, label: "Bedroom Cleaning" },
  { icon: Briefcase, label: "Office Cleaning" },
  { icon: Car, label: "Car Cleaning" },
  { icon: Truck, label: "Vehicle Cleaning" },
  { icon: Laptop, label: "Laptop Cleaning" },
  { icon: Smartphone, label: "Mobile Cleaning" },
  { icon: ToggleLeft, label: "Switchboard Cleaning" },
  { icon: Hotel, label: "Hotel Cleaning" },
  { icon: Stethoscope, label: "Hospital Cleaning" },
  { icon: Sparkles, label: "General Surface Cleaning" },
];

export function Uses() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">One Bottle. Multiple Cleaning Uses.</h2>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {uses.map((u) => (
            <Reveal
              as="li"
              key={u.label}
              className="group rounded-2xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
            >
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-gradient-brand group-hover:text-primary-foreground">
                <u.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium leading-snug">{u.label}</p>
            </Reveal>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-3xl rounded-2xl bg-surface p-5 text-center text-sm text-muted-foreground">
          Always follow the recommended usage instructions and test on a small, hidden area before
          using on delicate surfaces.
        </p>
      </div>
    </section>
  );
}
