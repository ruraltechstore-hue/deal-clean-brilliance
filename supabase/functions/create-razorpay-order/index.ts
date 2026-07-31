// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/utils.ts";

/**
 * create-razorpay-order
 * Creates a Razorpay order for the requested quantity and stores a PENDING
 * order row. Prices come from the database — never from the client.
 *
 * Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,
 *          SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) return json({ error: "Razorpay is not configured" }, 500);

    const body = await req.json();
    const quantity = Number(body?.quantity);
    const c = body?.customer ?? {};
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return json({ error: "Invalid quantity" }, 400);
    }
    for (const field of ["name", "phone", "email", "address", "city", "state", "pincode"]) {
      if (!String(c[field] ?? "").trim()) return json({ error: `Missing ${field}` }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: product, error: productError } = await admin
      .from("products")
      .select("id, price, is_available, stock_quantity")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (productError || !product) return json({ error: "Product not found" }, 400);
    if (!product.is_available) return json({ error: "Product is out of stock" }, 400);

    const { data: settings } = await admin
      .from("business_settings")
      .select("delivery_charge, free_delivery_threshold, order_prefix")
      .limit(1)
      .maybeSingle();

    const price = Number(product.price);
    const subtotal = price * quantity;
    const threshold = settings?.free_delivery_threshold;
    const deliveryCharge =
      threshold != null && subtotal >= Number(threshold) ? 0 : Number(settings?.delivery_charge ?? 0);
    const total = subtotal + deliveryCharge;
    const orderNumber = `${settings?.order_prefix ?? "DEAL-"}${Date.now().toString(36).toUpperCase()}`;

    // Create the Razorpay order (amount in paise).
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: orderNumber,
        notes: { order_number: orderNumber, customer_name: c.name, phone: c.phone },
      }),
    });
    const rzpOrder: any = await rzpRes.json();
    if (!rzpRes.ok) {
      return json({ error: rzpOrder?.error?.description ?? "Razorpay order failed" }, 502);
    }

    // Upsert the customer, then store a pending order.
    const { data: customer, error: customerError } = await admin
      .from("customers")
      .insert({ name: c.name, phone: c.phone, email: c.email })
      .select("id")
      .single();
    if (customerError) return json({ error: customerError.message }, 500);

    const { error: orderError } = await admin.from("orders").insert({
      order_number: orderNumber,
      customer_id: customer.id,
      product_id: product.id,
      quantity,
      product_price: price,
      delivery_charge: deliveryCharge,
      total_amount: total,
      payment_status: "pending",
      order_status: "new",
      razorpay_order_id: rzpOrder.id,
      shipping_address: c.address,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
    });
    if (orderError) return json({ error: orderError.message }, 500);

    return json({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: keyId,
      order_number: orderNumber,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
