import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { orderService } from "@/services/orderService";
import type { OrderStatus } from "@/types/database";
import { formatINR } from "@/lib/site-config";

const statuses: OrderStatus[] = ["new", "processing", "shipped", "delivered", "cancelled"];

export const Route = createFileRoute("/admin/_protected/orders")({
  ssr: false,
  component: Orders,
  head: () => ({
    meta: [
      { title: "Orders | DEAL Admin" },
      { name: "description", content: "Manage DEAL CLEAN customer orders and fulfilment status." },
      { property: "og:title", content: "Orders | DEAL Admin" },
      { property: "og:description", content: "Manage customer orders." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function Orders() {
  const qc = useQueryClient();
  const orders = useQuery({ queryKey: ["orders"], queryFn: orderService.listOrders });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Order status updated.");
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminLayout title="Orders" description="All orders placed through the storefront.">
      <div className="card-premium overflow-x-auto p-6">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Order</th>
              <th className="py-2">Date</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Address</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Total</th>
              <th className="py-2">Payment</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders.data ?? []).map((o) => (
              <tr key={o.id} className="border-t border-border align-top">
                <td className="py-3 font-medium">
                  {o.order_number}
                  <div className="text-xs text-muted-foreground">{o.razorpay_payment_id ?? "—"}</div>
                </td>
                <td className="py-3">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                <td className="py-3">
                  {o.customers?.name ?? "—"}
                  <div className="text-xs text-muted-foreground">{o.customers?.phone}</div>
                </td>
                <td className="max-w-[220px] py-3 text-xs text-muted-foreground">
                  {o.shipping_address}
                  {o.city ? `, ${o.city}` : ""} {o.pincode}
                </td>
                <td className="py-3">{o.quantity}</td>
                <td className="py-3">{formatINR(Number(o.total_amount))}</td>
                <td className="py-3">{o.payment_status}</td>
                <td className="py-3">
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={o.order_status}
                    onChange={(e) =>
                      setStatus.mutate({ id: o.id, status: e.target.value as OrderStatus })
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {(orders.data ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
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
