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
  customer: CustomerDetails;
};

export type CreateOrderResult = {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  order_number: string;
};

export type VerifyPaymentInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export const paymentService = {
  /** Creates a Razorpay order server-side (amount is computed on the server). */
  createOrder(input: CreateOrderInput) {
    return callFunction<CreateOrderResult>("create-razorpay-order", input);
  },

  /** Verifies the signature server-side and marks the order paid. */
  verifyPayment(input: VerifyPaymentInput) {
    return callFunction<{ success: boolean; order_number: string }>(
      "verify-razorpay-payment",
      input,
    );
  },

  /** Loads the Razorpay checkout script on demand. */
  loadCheckout(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject(new Error("Not in browser"));
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
      document.body.appendChild(script);
    });
  },
};
