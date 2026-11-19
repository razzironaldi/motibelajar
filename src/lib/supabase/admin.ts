import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

export function createStorageWorkerClient() {
  const config = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return config && serviceRoleKey
    ? createClient(config.url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;
}
