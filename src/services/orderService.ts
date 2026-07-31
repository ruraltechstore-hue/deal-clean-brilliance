import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus, OrderStatusHistory, OrderWithCustomer } from "@/types/database";

export type CustomerDetails = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export const orderService = {
  /** Admin only (RLS enforced). */
  async listOrders(): Promise<OrderWithCustomer[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as OrderWithCustomer[];
  },

  async getOrder(id: string): Promise<OrderWithCustomer | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as unknown as OrderWithCustomer | null;
  },

  async updateOrderStatus(id: string, order_status: OrderStatus): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .update({ order_status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAdminNotes(id: string, admin_notes: string): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .update({ admin_notes })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const { data, error } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
