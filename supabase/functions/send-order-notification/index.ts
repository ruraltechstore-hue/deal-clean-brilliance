import { corsHeaders, json } from "../_shared/utils.ts";
import {
  sendEmailNotification,
  sendWhatsAppNotification,
  type OrderNotification,
} from "../_shared/notifications.ts";

/**
 * send-order-notification (OPTIONAL)
 * Provider-agnostic notification dispatcher. It does nothing until you set the
 * NOTIFY_EMAIL_* / WHATSAPP_* secrets in your Supabase project.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const order = (await req.json()) as OrderNotification;
    if (!order?.order_number) return json({ error: "order_number is required" }, 400);

    const [email, whatsapp] = await Promise.all([
      sendEmailNotification(order),
      sendWhatsAppNotification(order),
    ]);
    return json({ email, whatsapp });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
