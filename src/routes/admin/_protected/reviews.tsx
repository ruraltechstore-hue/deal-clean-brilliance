import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";

export const Route = createFileRoute("/admin/_protected/reviews")({
  ssr: false,
  component: ReviewsAdmin,
  head: () => ({
    meta: [
      { title: "Reviews | DEAL Admin" },
      { name: "description", content: "Approve or reject customer reviews for DEAL CLEAN." },
      { property: "og:title", content: "Reviews | DEAL Admin" },
      { property: "og:description", content: "Moderate customer reviews." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ReviewsAdmin() {
  const qc = useQueryClient();
  const reviews = useQuery({ queryKey: ["reviews"], queryFn: adminService.listReviews });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["reviews"] });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" | "pending" }) =>
      adminService.setReviewStatus(id, status),
    onSuccess: () => {
      toast.success("Review updated.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      toast.success("Review deleted.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminLayout title="Reviews" description="Only approved reviews appear on the storefront.">
      <div className="space-y-3">
        {(reviews.data ?? []).map((r) => (
          <div key={r.id} className="card-premium flex flex-wrap items-start gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {r.customer_name ?? "Anonymous"}{" "}
                <span className="text-xs text-muted-foreground">
                  · {r.rating ?? 0}/5 · {r.approval_status}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{r.review}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-full"
                onClick={() => setStatus.mutate({ id: r.id, status: "approved" })}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })}
              >
                Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => remove.mutate(r.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {(reviews.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews submitted yet.</p>
        )}
      </div>
    </AdminLayout>
  );
}
