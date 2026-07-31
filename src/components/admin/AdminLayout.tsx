import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Box,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Star,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { brand } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/product", label: "Product", icon: Box },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/contact-messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <img src={brand.logoUrl} alt="" className="h-9 w-9 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{brand.name}</p>
            <p className="truncate text-xs text-muted-foreground">Admin dashboard</p>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {profile?.email ?? profile?.full_name}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full">
            <LogOut className="mr-1 h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
        <nav className="mx-auto max-w-7xl overflow-x-auto px-4 pb-2 sm:px-6">
          <ul className="flex gap-1">
            {nav.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
