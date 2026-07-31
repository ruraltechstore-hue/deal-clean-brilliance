import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupabaseNotConfigured } from "@/components/admin/AdminStates";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";

export const Route = createFileRoute("/admin/forgot-password")({
  ssr: false,
  component: ForgotPassword,
  head: () => ({
    meta: [
      { title: "Reset Admin Password | DEAL Cleaning Products" },
      { name: "description", content: "Request a password reset link for the admin dashboard." },
      { property: "og:title", content: "Reset Admin Password" },
      { property: "og:description", content: "Request a password reset link." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ForgotPassword() {
  const { configured } = useAuth();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!configured) return <SupabaseNotConfigured />;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) {
      toast.error("Enter your email.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(
        email,
        `${window.location.origin}/admin/reset-password`,
      );
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="card-premium w-full max-w-md p-8">
        <h1 className="text-xl font-bold">Forgot password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            If an account exists for that email, a reset link has been sent. Open it to set a new
            password.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Admin email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <Link
          to="/admin/login"
          className="mt-6 inline-block text-xs text-secondary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
