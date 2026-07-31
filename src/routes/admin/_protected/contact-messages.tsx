import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";
import type { MessageStatus } from "@/types/database";

export const Route = createFileRoute("/admin/_protected/contact-messages")({
  ssr: false,
  component: Messages,
  head: () => ({
    meta: [
      { title: "Messages | DEAL Admin" },
      { name: "description", content: "Contact form enquiries received from the storefront." },
      { property: "og:title", content: "Messages | DEAL Admin" },
      { property: "og:description", content: "Contact form enquiries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function Messages() {
  const qc = useQueryClient();
  const messages = useQuery({ queryKey: ["messages"], queryFn: adminService.listMessages });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MessageStatus }) =>
      adminService.setMessageStatus(id, status),
    onSuccess: () => {
      toast.success("Message updated.");
      void qc.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminLayout title="Contact messages" description="Enquiries submitted from the website.">
      <div className="space-y-3">
        {(messages.data ?? []).map((m) => (
          <div key={m.id} className="card-premium p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {m.phone} · {m.email} · {new Date(m.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent px-3 py-1 text-xs">{m.status}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setStatus.mutate({ id: m.id, status: "read" })}
                >
                  Mark read
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setStatus.mutate({ id: m.id, status: "archived" })}
                >
                  Archive
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{m.message}</p>
          </div>
        ))}
        {(messages.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}
