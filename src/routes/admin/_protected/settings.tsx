import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/adminService";
import type { BusinessSettings } from "@/types/database";

export const Route = createFileRoute("/admin/_protected/settings")({
  ssr: false,
  component: SettingsAdmin,
  head: () => ({
    meta: [
      { title: "Settings | DEAL Admin" },
      { name: "description", content: "Business contact details and delivery charge settings." },
      { property: "og:title", content: "Settings | DEAL Admin" },
      { property: "og:description", content: "Business settings." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: adminService.getSettings });

  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<BusinessSettings> }) =>
      adminService.updateSettings(id, patch),
    onSuccess: () => {
      toast.success("Settings saved.");
      void qc.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const s = settings.data;
  if (!s) {
    return (
      <AdminLayout title="Settings">
        <p className="text-sm text-muted-foreground">
          No settings row found. Run the SQL migrations (they seed a default row).
        </p>
      </AdminLayout>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      id: s.id,
      patch: {
        business_name: String(fd.get("business_name")),
        business_email: String(fd.get("business_email")),
        phone_number_1: String(fd.get("phone_number_1")),
        phone_number_2: String(fd.get("phone_number_2")),
        delivery_charge: Number(fd.get("delivery_charge")),
        free_delivery_threshold: fd.get("free_delivery_threshold")
          ? Number(fd.get("free_delivery_threshold"))
          : null,
        order_prefix: String(fd.get("order_prefix")),
      },
    });
  };

  const text = (name: keyof BusinessSettings, label: string, type = "text") => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={(s[name] as string | number | null) ?? ""}
        className="mt-1.5"
      />
    </div>
  );

  return (
    <AdminLayout title="Settings" description="Business details used across the storefront.">
      <form onSubmit={onSubmit} className="card-premium grid max-w-3xl gap-4 p-6 sm:grid-cols-2">
        {text("business_name", "Business name")}
        {text("business_email", "Business email", "email")}
        {text("phone_number_1", "Phone number 1")}
        {text("phone_number_2", "Phone number 2")}
        {text("order_prefix", "Order number prefix")}
        {text("delivery_charge", "Delivery charge (INR)", "number")}
        {text("free_delivery_threshold", "Free delivery above (INR)", "number")}
        <div className="sm:col-span-2">
          <Button type="submit" className="rounded-full" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
