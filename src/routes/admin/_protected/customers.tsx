import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/_protected/customers")({
  ssr: false,
  component: Customers,
  head: () => ({
    meta: [
      { title: "Customers | DEAL Admin" },
      { name: "description", content: "Customer records collected from DEAL CLEAN orders." },
      { property: "og:title", content: "Customers | DEAL Admin" },
      { property: "og:description", content: "Customer records." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function Customers() {
  const customers = useQuery({ queryKey: ["customers"], queryFn: adminService.listCustomers });

  return (
    <AdminLayout title="Customers" description="People who have ordered DEAL CLEAN.">
      <div className="card-premium overflow-x-auto p-6">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Phone</th>
              <th className="py-2">Email</th>
              <th className="py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(customers.data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="py-3 font-medium">{c.name ?? "—"}</td>
                <td className="py-3">{c.phone ?? "—"}</td>
                <td className="py-3">{c.email ?? "—"}</td>
                <td className="py-3">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {(customers.data ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
