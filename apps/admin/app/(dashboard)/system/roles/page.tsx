import { Check } from "lucide-react";
import {
  ADMIN_ROLE_LABELS,
  type AdminPermissionRow,
  type AdminRole,
} from "@actone/shared";
import { Card, EmptyRow, PageHeader } from "@/components/ui";
import { requirePermission } from "@/lib/admin";
import { RoleSelectForm } from "./role-select-form";

export const dynamic = "force-dynamic";

interface RolePermLink {
  admin_roles: { key: string } | null;
  admin_permissions: { key: string } | null;
}

interface AdminRow {
  id: string;
  user_id: string;
  email: string | null;
  is_active: boolean;
  role_key: string;
}

export default async function RolesPage() {
  const { supabase, user } = await requirePermission("system.roles");

  const [rolesRes, permsRes, mapRes, adminsRes] = await Promise.all([
    supabase.from("admin_roles").select("*").order("sort_order"),
    supabase.from("admin_permissions").select("*").order("sort_order"),
    supabase
      .from("admin_role_permissions")
      .select("admin_roles(key), admin_permissions(key)"),
    supabase
      .from("admin_users")
      .select("id, user_id, email, is_active, role_key")
      .order("created_at"),
  ]);

  const roles = (rolesRes.data as AdminRole[] | null) ?? [];
  const perms = (permsRes.data as AdminPermissionRow[] | null) ?? [];
  const links = (mapRes.data as RolePermLink[] | null) ?? [];
  const admins = (adminsRes.data as AdminRow[] | null) ?? [];

  // roleKey -> Set(permKey)
  const grants = new Map<string, Set<string>>();
  for (const l of links) {
    const rk = l.admin_roles?.key;
    const pk = l.admin_permissions?.key;
    if (!rk || !pk) continue;
    if (!grants.has(rk)) grants.set(rk, new Set());
    grants.get(rk)!.add(pk);
  }

  // resolve admin nicknames
  const ids = admins.map((a) => a.user_id);
  const nameMap = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname, email")
      .in("id", ids);
    for (const p of (profiles as { id: string; nickname: string | null; email: string | null }[] | null) ??
      [])
      nameMap.set(p.id, p.nickname ?? p.email ?? p.id.slice(0, 8));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="역할·권한"
        description="관리자 역할별 권한과 관리자 계정의 역할을 관리합니다."
      />

      {/* admin -> role assignment */}
      <section>
        <h2 className="font-semibold text-foreground">관리자 역할 지정</h2>
        <Card className="mt-3 p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b bg-surface text-left text-xs text-muted">
                  <th className="px-4 py-3 font-medium">관리자</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium">역할</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className="border-b bg-background last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {nameMap.get(a.user_id) ?? a.email ?? "-"}
                        {a.user_id === user.id ? (
                          <span className="ml-1.5 text-xs text-accent-soft">(나)</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted">{a.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {a.is_active ? (
                        <span className="text-xs text-emerald-400">활성</span>
                      ) : (
                        <span className="text-xs text-muted">비활성</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RoleSelectForm adminUserId={a.id} currentRole={a.role_key} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {admins.length === 0 ? <EmptyRow message="관리자가 없습니다." /> : null}
        </Card>
      </section>

      {/* role x permission matrix */}
      <section>
        <h2 className="font-semibold text-foreground">역할별 권한 매트릭스</h2>
        <p className="mt-1 text-xs text-muted">
          최고관리자는 항상 모든 권한을 가집니다. 매트릭스는 현재 DB에 설정된 값을 표시합니다.
        </p>
        <Card className="mt-3 p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-surface text-left text-xs text-muted">
                  <th className="sticky left-0 bg-surface px-4 py-3 font-medium">권한</th>
                  {roles.map((r) => (
                    <th key={r.key} className="px-3 py-3 text-center font-medium">
                      {ADMIN_ROLE_LABELS[r.key] ?? r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr key={p.key} className="border-b bg-background last:border-b-0">
                    <td className="sticky left-0 bg-background px-4 py-2.5 text-foreground">
                      {p.label}
                    </td>
                    {roles.map((r) => {
                      const has = r.key === "super_admin" || grants.get(r.key)?.has(p.key);
                      return (
                        <td key={r.key} className="px-3 py-2.5 text-center">
                          {has ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-400" aria-label="허용" />
                          ) : (
                            <span className="text-muted/40" aria-label="없음">
                              ·
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
