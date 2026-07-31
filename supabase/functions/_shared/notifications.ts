/**
 * Optional notification helpers.
 * Nothing is sent unless the matching secrets are configured in your Supabase
 * project. No provider is hardcoded — set NOTIFY_EMAIL_PROVIDER /
 * WHATSAPP_PROVIDER plus their endpoint + token secrets when you are ready.
 */

export type OrderNotification = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  quantity: number;
  address: string;
};

/**
 * Generic HTTP email dispatch.
 * Secrets:
 *   NOTIFY_EMAIL_PROVIDER   e.g. "custom" (any label — only used for logging)
 *   NOTIFY_EMAIL_ENDPOINT   full HTTPS endpoint of your provider
 *   NOTIFY_EMAIL_API_KEY    bearer token for that endpoint
 *   NOTIFY_EMAIL_FROM       from address
 *   NOTIFY_EMAIL_TO         admin recipient address
 */
export async function sendEmailNotification(order: OrderNotification) {
  const endpoint = Deno.env.get("NOTIFY_EMAIL_ENDPOINT");
  const apiKey = Deno.env.get("NOTIFY_EMAIL_API_KEY");
  const from = Deno.env.get("NOTIFY_EMAIL_FROM");
  const to = Deno.env.get("NOTIFY_EMAIL_TO");
  if (!endpoint || !apiKey || !from || !to) {
    return { skipped: true, reason: "email provider not configured" };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from,
      to,
      subject: `New order ${order.order_number}`,
      text:
        `Order: ${order.order_number}\n` +
        `Customer: ${order.customer_name} (${order.customer_phone}, ${order.customer_email})\n` +
        `Quantity: ${order.quantity}\n` +
        `Total: INR ${order.total_amount}\n` +
        `Address: ${order.address}`,
    }),
  });
  return { skipped: false, ok: res.ok, status: res.status };
}

/**
 * Generic WhatsApp Business API dispatch.
 * Secrets:
 *   WHATSAPP_API_URL        e.g. https://graph.facebook.com/v20.0/<phone-id>/messages
 *   WHATSAPP_API_TOKEN      bearer token
 *   WHATSAPP_ADMIN_NUMBER   destination number in international format
 */
export async function sendWhatsAppNotification(order: OrderNotification) {
  const url = Deno.env.get("WHATSAPP_API_URL");
  const token = Deno.env.get("WHATSAPP_API_TOKEN");
  const toNumber = Deno.env.get("WHATSAPP_ADMIN_NUMBER");
  if (!url || !token || !toNumber) {
    return { skipped: true, reason: "whatsapp provider not configured" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toNumber,
      type: "text",
      text: {
        body:
          `New order ${order.order_number}\n` +
          `${order.customer_name} — ${order.customer_phone}\n` +
          `Qty ${order.quantity} · INR ${order.total_amount}`,
      },
    }),
  });
  return { skipped: false, ok: res.ok, status: res.status };
}
