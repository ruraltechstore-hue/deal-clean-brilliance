import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService } from "@/services/adminService";
import { orderService } from "@/services/orderService";
import { formatINR } from "@/lib/site-config";

export const Route = createFileRoute("/admin/_protected/dashboard")({
  ssr: false,
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard | DEAL Admin" },
      { name: "description", content: "Sales overview for DEAL Cleaning Products." },
      { property: "og:title", content: "Dashboard | DEAL Admin" },
      { property: "og:description", content: "Sales overview." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-premium p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function Dashboard() {
  const summary = useQuery({ queryKey: ["sales-summary"], queryFn: adminService.getSalesSummary });
  const orders = useQuery({ queryKey: ["orders"], queryFn: orderService.listOrders });

  const recent = (orders.data ?? []).slice(0, 8);

  return (
    <AdminLayout title="Dashboard" description="Live sales and order overview.">
      {summary.isError && (
        <p className="text-sm text-destructive">
          Could not load analytics. Check your Supabase connection and admin role.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={summary.data?.totalOrders ?? "—"} />
        <Stat label="Paid orders" value={summary.data?.paidOrders ?? "—"} />
        <Stat label="New orders" value={summary.data?.pendingOrders ?? "—"} />
        <Stat
          label="Revenue (paid)"
          value={summary.data ? formatINR(summary.data.revenue) : "—"}
        />
      </div>

      <div className="card-premium mt-8 overflow-x-auto p-6">
        <h2 className="text-lg font-bold">Recent orders</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Order</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Total</th>
              <th className="py-2">Payment</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="py-2 font-medium">{o.order_number}</td>
                <td className="py-2">{o.customers?.name ?? "—"}</td>
                <td className="py-2">{formatINR(Number(o.total_amount))}</td>
                <td className="py-2">{o.payment_status}</td>
                <td className="py-2">{o.order_status}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
