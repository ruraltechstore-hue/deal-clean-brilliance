import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/database";

export const productService = {
  /** Public read — allowed by the "public can read available products" RLS policy. */
  async getPrimaryProduct(): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async listProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /** Admin only (RLS enforced). */
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Uploads to the public `product-images` storage bucket. Admin only. */
  async uploadImage(file: File): Promise<string> {
    const path = `products/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  },
};
