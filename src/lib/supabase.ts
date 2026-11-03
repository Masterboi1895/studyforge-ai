import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
export function browserDb() {
  if (!supabaseConfigured()) throw new Error("Supabase is not configured. Set the public URL and anon key.");
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
export async function serverDb() {
  if (!supabaseConfigured()) throw new Error("Supabase is not configured.");
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return jar.getAll(); }, setAll(values) { try { values.forEach(({name,value,options})=>jar.set(name,value,options)); } catch {} } }
  });
}
