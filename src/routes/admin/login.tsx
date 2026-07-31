import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupabaseNotConfigured } from "@/components/admin/AdminStates";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { brand } from "@/lib/site-config";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  component: AdminLogin,
  head: () => ({
    meta: [
      { title: "Admin Sign In | DEAL Cleaning Products" },
      { name: "description", content: "Private administrator sign in for DEAL Cleaning Products." },
      { property: "og:title", content: "Admin Sign In" },
      { property: "og:description", content: "Private administrator sign in." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminLogin() {
  const { configured, session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      void navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  if (!configured) return <SupabaseNotConfigured />;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.signIn(email, password);
      toast.success("Signed in.");
      await navigate({ to: "/admin/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="card-premium w-full max-w-md p-8">
        <div className="flex items-center gap-3">
          <img src={brand.logoUrl} alt="" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-xl font-bold">Admin Sign In</h1>
            <p className="text-xs text-muted-foreground">{brand.name}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 flex justify-between text-xs">
          <Link to="/admin/forgot-password" className="text-secondary hover:underline">
            Forgot password?
          </Link>
          <Link to="/" className="text-muted-foreground hover:underline">
            Back to store
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Admin accounts are created manually in the Supabase Authentication dashboard.
        </p>
      </div>
    </div>
  );
}
