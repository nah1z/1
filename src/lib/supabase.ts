import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY，請參考 .env.example 設定 .env",
  );
}

export const supabase = createClient(url, anonKey);
