import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupabaseNotConfigured() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="card-premium max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-secondary" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-bold">Supabase is not configured</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your{" "}
          <code>.env</code> file (see <code>.env.example</code>) and restart the dev server.
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-full">
          <Link to="/">Back to store</Link>
        </Button>
      </div>
    </div>
  );
}

export function AccessDenied({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface px-4">
      <div className="card-premium max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to access this dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={onSignOut} className="rounded-full">
            Sign out
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Back to store</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface">
      <p className="text-sm text-muted-foreground">Checking your access…</p>
    </div>
  );
}
