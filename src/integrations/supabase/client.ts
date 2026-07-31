import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

/** True when both env variables are present. Use it to show a setup notice. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Reusable Supabase browser client.
 * Credentials come from .env (see .env.example) — never hardcode them.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "public-anon-key-not-configured",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "deal-clean-auth",
    },
  },
);

/** Base URL for invoking Edge Functions of the connected Supabase project. */
export const functionsBaseUrl = supabaseUrl ? `${supabaseUrl}/functions/v1` : "";
