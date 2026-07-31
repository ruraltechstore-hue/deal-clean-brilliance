import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, hmacSha256Hex, json, safeEqual } from "../_shared/utils.ts";
import { sendEmailNotification, sendWhatsAppNotification } from "../_shared/notifications.ts";

/**
 * verify-razorpay-payment
 * Verifies the Razorpay checkout signature server-side and marks the order paid.
 *
 * Secrets: RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) return json({ error: "Razorpay is not configured" }, 500);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: "Missing payment fields" }, 400);
    }

    const expected = await hmacSha256Hex(keySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (!safeEqual(expected, String(razorpay_signature))) {
      return json({ error: "Invalid payment signature" }, 401);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: order, error } = await admin
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "new",
        razorpay_payment_id,
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select("*, customers(name, phone, email)")
      .single();
    if (error || !order) return json({ error: error?.message ?? "Order not found" }, 404);

    const notification = {
      order_number: order.order_number,
      customer_name: order.customers?.name ?? "",
      customer_phone: order.customers?.phone ?? "",
      customer_email: order.customers?.email ?? "",
      total_amount: Number(order.total_amount),
      quantity: order.quantity,
      address: `${order.shipping_address ?? ""}, ${order.city ?? ""}, ${order.state ?? ""} - ${order.pincode ?? ""}`,
    };
    // Both are no-ops until the corresponding secrets are configured.
    await Promise.allSettled([
      sendEmailNotification(notification),
      sendWhatsAppNotification(notification),
    ]);

    return json({ success: true, order_number: order.order_number });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
