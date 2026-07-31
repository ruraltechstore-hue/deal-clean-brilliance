/**
 * Planned database structure (for when a backend is connected).
 * These types mirror the tables the storefront expects.
 *
 * products        — single product: DEAL CLEAN 500 ml
 * customers       — buyers
 * orders          — one row per placed order
 * order_items     — line items belonging to an order
 * reviews         — customer reviews
 * contact_messages— contact form submissions
 */

export type ProductRow = {
  id: string;
  name: string;
  size: string;
  price: number;
  stock: number;
  available: boolean;
  image_url: string;
  description: string;
};

export type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
};

export type OrderRow = {
  id: string;
  customer_id: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  payment_ref: string | null;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
};

export type ReviewRow = {
  id: string;
  product_id: string;
  name: string;
  city: string | null;
  rating: number;
  text: string;
  approved: boolean;
  created_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
};
