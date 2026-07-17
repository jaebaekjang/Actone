import { ADMIN_PERMISSIONS, type AdminPermission } from "@actone/shared";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ALL_PERMISSIONS: ReadonlySet<AdminPermission> = new Set(ADMIN_PERMISSIONS);

/**
 * Resolve the effective permission set for an admin's role.
 * super_admin always has the full catalog; other roles read their mapping
 * from admin_role_permissions. Unknown/empty roles fall back to an empty set
 * (dashboard-only access is granted explicitly to every seeded role).
 */
export async function loadPermissions(
  supabase: SupabaseClient,
  roleKey: string,
): Promise<Set<AdminPermission>> {
  if (roleKey === "super_admin") return new Set(ADMIN_PERMISSIONS);

  const { data } = await supabase
    .from("admin_roles")
    .select("key, admin_role_permissions(admin_permissions(key))")
    .eq("key", roleKey)
    .maybeSingle();

  const set = new Set<AdminPermission>();
  const links = (data as { admin_role_permissions?: { admin_permissions?: { key?: string } | null }[] } | null)
    ?.admin_role_permissions;
  for (const link of links ?? []) {
    const key = link.admin_permissions?.key;
    if (key && (ADMIN_PERMISSIONS as readonly string[]).includes(key)) {
      set.add(key as AdminPermission);
    }
  }
  return set;
}
