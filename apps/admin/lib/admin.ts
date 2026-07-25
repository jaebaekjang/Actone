import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminPermission, Profile } from "@actone/shared";
import { createClient } from "./supabase";
import { loadPermissions } from "./permissions";

/**
 * Admin access requires ALL of:
 *  1. authenticated Supabase session
 *  2. profiles.role = 'admin'
 *  3. active row in admin_users (is_active = true)
 * Called from the dashboard layout AND from every admin server action —
 * never rely on hidden UI alone. RLS enforces the same rules in the DB.
 *
 * Also resolves the admin's role and effective permission set (RBAC).
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
      .select("id, is_active, role_key")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile || (profile as Profile).role !== "admin" || !adminRow?.is_active) {
    redirect("/denied");
  }

  const roleKey = (adminRow as { role_key?: string }).role_key ?? "super_admin";
  const permissions = await loadPermissions(supabase, roleKey);

  return {
    supabase,
    user,
    profile: profile as Profile,
    adminUserId: (adminRow as { id: string }).id,
    roleKey,
    permissions,
    can: (perm: AdminPermission) => permissions.has(perm),
  };
});

/**
 * Gate a page or action behind a specific permission. Redirects to /denied
 * when the current admin lacks it. super_admin holds every permission.
 */
export async function requirePermission(perm: AdminPermission) {
  const ctx = await requireAdmin();
  if (!ctx.can(perm)) redirect("/denied");
  return ctx;
}

interface LogInput {
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  summary?: string | null;
  before?: unknown;
  after?: unknown;
}

/**
 * Append an entry to admin_activity_logs. Best-effort: logging failures never
 * block the underlying admin action. IP / user-agent are captured from the
 * request headers when available.
 */
export async function logActivity(input: LogInput): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;

    await supabase.from("admin_activity_logs").insert({
      admin_id: user.id,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      summary: input.summary ?? null,
      before_data: input.before ?? null,
      after_data: input.after ?? null,
      ip,
      user_agent: h.get("user-agent"),
    });
  } catch {
    // never let audit logging break the primary mutation
  }
}
