import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { productService } from "@/services/productService";
import type { Product } from "@/types/database";

export const Route = createFileRoute("/admin/_protected/product")({
  ssr: false,
  component: ProductAdmin,
  head: () => ({
    meta: [
      { title: "Product | DEAL Admin" },
      { name: "description", content: "Edit DEAL CLEAN pricing, stock and product details." },
      { property: "og:title", content: "Product | DEAL Admin" },
      { property: "og:description", content: "Edit product details." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ProductAdmin() {
  const qc = useQueryClient();
  const product = useQuery({ queryKey: ["product"], queryFn: productService.getPrimaryProduct });

  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Product> }) =>
      productService.updateProduct(id, patch),
    onSuccess: () => {
      toast.success("Product updated.");
      void qc.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upload = useMutation({
    mutationFn: (file: File) => productService.uploadImage(file),
    onSuccess: (url) => {
      if (product.data) save.mutate({ id: product.data.id, patch: { image_url: url } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const p = product.data;

  if (!p) {
    return (
      <AdminLayout title="Product">
        <p className="text-sm text-muted-foreground">
          No product row found. Run the SQL migrations (they seed DEAL CLEAN 500 ml).
        </p>
      </AdminLayout>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      id: p.id,
      patch: {
        name: String(fd.get("name")),
        description: String(fd.get("description")),
        price: Number(fd.get("price")),
        stock_quantity: Number(fd.get("stock_quantity")),
        is_available: fd.get("is_available") === "on",
        usage_instructions: String(fd.get("usage_instructions")),
        image_url: String(fd.get("image_url")),
      },
    });
  };

  return (
    <AdminLayout title="Product" description="Everything shown on the storefront product section.">
      <form onSubmit={onSubmit} className="card-premium max-w-2xl space-y-4 p-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={p.name} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={p.description ?? ""}
            className="mt-1.5"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Price (INR)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="1"
              defaultValue={p.price}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="stock_quantity">Stock quantity</Label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              defaultValue={p.stock_quantity}
              className="mt-1.5"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="usage_instructions">Usage instructions</Label>
          <Textarea
            id="usage_instructions"
            name="usage_instructions"
            rows={4}
            defaultValue={p.usage_instructions ?? ""}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            name="image_url"
            defaultValue={p.image_url ?? ""}
            className="mt-1.5"
          />
          <input
            type="file"
            accept="image/*"
            className="mt-2 text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
            }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Uploads go to the <code>product-images</code> storage bucket.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_available" defaultChecked={p.is_available} />
          Available for purchase
        </label>
        <Button type="submit" className="rounded-full" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </AdminLayout>
  );
}
