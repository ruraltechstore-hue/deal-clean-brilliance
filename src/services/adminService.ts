import { supabase } from "@/integrations/supabase/client";
import type {
  BusinessSettings,
  ContactMessage,
  Customer,
  MessageStatus,
  Review,
} from "@/types/database";

export const adminService = {
  async listCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async setReviewStatus(id: string, approval_status: Review["approval_status"]) {
    const { error } = await supabase.from("reviews").update({ approval_status }).eq("id", id);
    if (error) throw error;
  },

  async deleteReview(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
  },

  async listMessages(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async setMessageStatus(id: string, status: MessageStatus) {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) throw error;
  },

  /** Public insert — allowed by the "anyone can submit a contact message" RLS policy. */
  async submitMessage(payload: Pick<ContactMessage, "name" | "phone" | "email" | "message">) {
    const { error } = await supabase.from("contact_messages").insert(payload);
    if (error) throw error;
  },

  async getSettings(): Promise<BusinessSettings | null> {
    const { data, error } = await supabase
      .from("business_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateSettings(id: string, patch: Partial<BusinessSettings>) {
    const { error } = await supabase.from("business_settings").update(patch).eq("id", id);
    if (error) throw error;
  },

  /** Sales analytics computed from orders (admin-only reads through RLS). */
  async getSalesSummary() {
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount, payment_status, order_status, created_at");
    if (error) throw error;
    const rows = data ?? [];
    const paid = rows.filter((r) => r.payment_status === "paid");
    const revenue = paid.reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0);
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return {
      totalOrders: rows.length,
      paidOrders: paid.length,
      pendingOrders: rows.filter((r) => r.order_status === "new").length,
      revenue,
      revenueLast30Days: paid
        .filter((r) => new Date(r.created_at as unknown as string).getTime() >= since)
        .reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0),
    };
  },
};
