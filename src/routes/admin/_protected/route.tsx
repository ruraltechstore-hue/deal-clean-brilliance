import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AccessDenied, AdminLoading, SupabaseNotConfigured } from "@/components/admin/AdminStates";
import { useAuth } from "@/hooks/useAuth";

/**
 * Protected admin layout.
 * ssr:false — the Supabase session lives in localStorage, which the server cannot read.
 * Access requires an authenticated user whose profiles.role = 'admin' (also enforced by RLS).
 */
export const Route = createFileRoute("/admin/_protected")({
  ssr: false,
  component: ProtectedAdminLayout,
});

function ProtectedAdminLayout() {
  const { configured, loading, session, isAdmin, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (configured && !loading && !session) {
      void navigate({ to: "/admin/login", replace: true });
    }
  }, [configured, loading, session, navigate]);

  if (!configured) return <SupabaseNotConfigured />;
  if (loading || !session) return <AdminLoading />;
  if (!profile) return <AdminLoading />;
  if (!isAdmin) return <AccessDenied onSignOut={() => void signOut()} />;

  return <Outlet />;
}
