import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupabaseNotConfigured } from "@/components/admin/AdminStates";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  component: ResetPassword,
  head: () => ({
    meta: [
      { title: "Set New Admin Password | DEAL Cleaning Products" },
      { name: "description", content: "Choose a new password for the admin dashboard." },
      { property: "og:title", content: "Set New Admin Password" },
      { property: "og:description", content: "Choose a new admin password." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ResetPassword() {
  const { configured } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!configured) return <SupabaseNotConfigured />;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.updatePassword(password);
      toast.success("Password updated.");
      await navigate({ to: "/admin/dashboard", replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the password. Open the reset link again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="card-premium w-full max-w-md p-8">
        <h1 className="text-xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open this page from the reset email link so your recovery session is active.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={submitting}>
            {submitting ? "Saving…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
