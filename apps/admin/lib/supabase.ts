import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@actone/shared/supabase/server";

export async function createClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(cookieStore);
}
