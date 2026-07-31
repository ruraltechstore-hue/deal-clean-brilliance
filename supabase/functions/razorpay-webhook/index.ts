// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, hmacSha256Hex, json, safeEqual } from "../_shared/utils.ts";

/**
 * razorpay-webhook
 * Receives Razorpay server-to-server events and reconciles order state.
 * Configure the webhook URL in the Razorpay dashboard and set the same secret
 * as RAZORPAY_WEBHOOK_SECRET in Supabase.
 *
 * Deploy with --no-verify-jwt so Razorpay can reach it.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return json({ error: "Webhook secret not configured" }, 500);

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = await hmacSha256Hex(secret, raw);
  if (!signature || !safeEqual(expected, signature)) {
    return json({ error: "Invalid signature" }, 401);
  }

  const event: any = JSON.parse(raw);
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const payment = event?.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  if (!razorpayOrderId) return json({ received: true });

  if (event.event === "payment.captured" || event.event === "order.paid") {
    await admin
      .from("orders")
      .update({ payment_status: "paid", razorpay_payment_id: payment.id })
      .eq("razorpay_order_id", razorpayOrderId);
  } else if (event.event === "payment.failed") {
    await admin
      .from("orders")
      .update({ payment_status: "failed", razorpay_payment_id: payment.id })
      .eq("razorpay_order_id", razorpayOrderId);
  } else if (event.event === "refund.processed") {
    await admin
      .from("orders")
      .update({ payment_status: "refunded" })
      .eq("razorpay_order_id", razorpayOrderId);
  }

  return json({ received: true });
});
