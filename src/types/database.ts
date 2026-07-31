/**
 * Hand-written types mirroring supabase/migrations.
 * Regenerate with: supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type UserRole = "customer" | "admin";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "new" | "processing" | "shipped" | "delivered" | "cancelled";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type MessageStatus = "new" | "read" | "responded" | "archived";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  is_available: boolean;
  benefits: string[] | null;
  usage_instructions: string | null;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  user_id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  product_id: string | null;
  quantity: number;
  product_price: number;
  delivery_charge: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  shipping_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderWithCustomer = Order & { customers: Customer | null };

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string | null;
  updated_by: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  customer_name: string | null;
  rating: number | null;
  review: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: MessageStatus;
  created_at: string;
};

export type BusinessSettings = {
  id: string;
  business_name: string | null;
  business_email: string | null;
  phone_number_1: string | null;
  phone_number_2: string | null;
  whatsapp_number: string | null;
  delivery_charge: number;
  free_delivery_threshold: number | null;
  order_prefix: string;
  updated_at: string;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      products: Table<Product>;
      customers: Table<Customer>;
      orders: Table<Order>;
      order_status_history: Table<OrderStatusHistory>;
      reviews: Table<Review>;
      contact_messages: Table<ContactMessage>;
      business_settings: Table<BusinessSettings>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { _user_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
