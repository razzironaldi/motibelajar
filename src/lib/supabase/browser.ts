import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const config = getSupabaseEnv();
  return config ? createBrowserClient(config.url, config.key) : null;
}
