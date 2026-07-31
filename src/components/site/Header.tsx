import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "@/components/site/CartSheet";
import { brand } from "@/lib/site-config";

const navLinks = [
  { label: "Home", hash: "home" },
  { label: "About", hash: "about" },
  { label: "Benefits", hash: "benefits" },
  { label: "How to Use", hash: "how-to-use" },
  { label: "Reviews", hash: "reviews" },
  { label: "Contact", hash: "contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_1fr_auto]">
        <Link to="/" hash="home" className="flex min-w-0 items-center gap-2">
          <img
            src={brand.logoUrl}
            alt="DEAL Cleaning Products logo"
            className="h-11 w-11 shrink-0 scale-[1.7] object-contain"
            width={44}
            height={44}
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-extrabold leading-tight text-secondary">
              DEAL
            </span>
            <span className="block truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Cleaning Products
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.hash}>
                <Link
                  to="/"
                  hash={l.hash}
                  className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-secondary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <CartSheet />
          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link to="/" hash="buy">
              Buy Now
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4">Menu</SheetTitle>
              <nav aria-label="Mobile" className="mt-2 px-2">
                <ul className="space-y-1">
                  {navLinks.map((l) => (
                    <li key={l.hash}>
                      <Link
                        to="/"
                        hash={l.hash}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-3 text-base font-medium hover:bg-accent hover:text-secondary"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-4 w-full rounded-full" onClick={() => setOpen(false)}>
                  <Link to="/" hash="buy">
                    Buy Now
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
