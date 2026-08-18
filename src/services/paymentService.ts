import { functionsBaseUrl, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { CustomerDetails } from "@/services/orderService";

const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
export const razorpayKeyId = import.meta.env["VITE_RAZORPAY_KEY_ID"] as string | undefined;

async function callFunction<T>(name: string, body: unknown): Promise<T> {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured. Add your .env values.");
  const res = await fetch(`${functionsBaseUrl}/${name}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: anonKey ?? "",
      authorization: `Bearer ${anonKey ?? ""}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `Request to ${name} failed`);
  return json;
}

export type CreateOrderInput = {
  quantity: number;
  transactionId: string;
  customer: CustomerDetails;
};

export type CreateOrderResult = {
  order_number: string;
  amount: number;
};

export const paymentService = {
  /** Creates an order server-side with the provided transaction ID. */
  createOrder(input: CreateOrderInput) {
    return callFunction<CreateOrderResult>("create-order", input);
  },
};
