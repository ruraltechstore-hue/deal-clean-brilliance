import { Link } from "@tanstack/react-router";
import { brand, contact } from "@/lib/site-config";

const siteLinks = [
  { label: "Home", hash: "home" },
  { label: "About", hash: "about" },
  { label: "Benefits", hash: "benefits" },
  { label: "How to Use", hash: "how-to-use" },
  { label: "Contact", hash: "contact" },
];

const policyLinks = [
  { label: "Shipping Policy", slug: "shipping" },
  { label: "Privacy Policy", slug: "privacy" },
  { label: "Terms and Conditions", slug: "terms" },
  { label: "Refund Policy", slug: "refund" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={brand.logoUrl}
                alt="DEAL Cleaning Products logo"
                className="h-12 w-12 object-contain"
                width={48}
                height={48}
                loading="lazy"
              />
              <span className="font-display text-lg font-extrabold text-secondary">
                DEAL Cleaning Products
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Powerful all-in-one cleaning solutions designed to help keep your spaces clean, fresh,
              and shining.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Explore
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {siteLinks.map((l) => (
                <li key={l.hash}>
                  <Link
                    to="/"
                    hash={l.hash}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Policies">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">Legal</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {policyLinks.map((l) => (
                <li key={l.slug}>
                  <Link
                    to="/policies/$slug"
                    params={{ slug: l.slug }}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 DEAL Cleaning Products. All rights reserved.</p>
          <p>
            {brand.company}, {brand.address} · {contact.phones[0]}
          </p>
        </div>
      </div>
    </footer>
  );
}
