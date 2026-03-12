import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  console.log("Client connecting to:", process.env.NEXT_PUBLIC_SUPABASE_URL); //consoleDebug
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}