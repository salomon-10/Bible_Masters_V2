"use client";

import { createSupabaseBrowserClient } from "@bible-masters/shared";
import { env } from "./env";

export function getSupabaseBrowserClient() {
  return createSupabaseBrowserClient({ url: env.supabaseUrl, anonKey: env.supabaseAnonKey });
}
