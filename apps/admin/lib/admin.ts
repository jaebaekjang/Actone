import { cache } from "react";
import { redirect } from "next/navigation";
import type { Profile } from "@actone/shared";
import { createClient } from "./supabase";

/**
 * Admin access requires ALL of:
 *  1. authenticated Supabase session
 *  2. profiles.role = 'admin'
 *  3. active row in admin_users (is_active = true)
 * Called from the dashboard layout AND from every admin server action —
 * never rely on hidden UI alone. RLS enforces the same rules in the DB.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: adminRow }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("admin_users")
      .select("id, is_active")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile || (profile as Profile).role !== "admin" || !adminRow?.is_active) {
    redirect("/denied");
  }

  return { supabase, user, profile: profile as Profile };
});
