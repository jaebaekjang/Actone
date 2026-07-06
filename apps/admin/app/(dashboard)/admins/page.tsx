import {
  formatDateTime,
  type AdminUser,
  type Profile,
} from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { Card, EmptyRow, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { toggleAdminActive } from "@/lib/actions";
import { AddAdminForm } from "./add-admin-form";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const { supabase, user } = await requireAdmin();

  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });
  const adminUsers = (data as AdminUser[] | null) ?? [];

  const userIds = adminUsers.map((a) => a.user_id);
  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("*").in("id", userIds)
    : { data: [] };
  const profileById = new Map(
    ((profilesData as Profile[] | null) ?? []).map((p) => [p.id, p]),
  );

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="관리자 계정"
        description="관리자 사이트 접근에는 profiles.role = admin 과 활성화된 admin_users 항목이 모두 필요합니다."
      />

      <div className="space-y-2">
        {adminUsers.length > 0 ? (
          adminUsers.map((adminUser) => {
            const profile = profileById.get(adminUser.user_id);
            const isSelf = adminUser.user_id === user.id;
            return (
              <div
                key={adminUser.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.nickname ?? "(닉네임 없음)"}
                      {isSelf ? <span className="ml-1 text-xs text-muted">(나)</span> : null}
                    </p>
                    {adminUser.is_active ? (
                      <StatusBadge label="활성" tone="positive" />
                    ) : (
                      <StatusBadge label="비활성" tone="negative" />
                    )}
                    {profile?.role !== "admin" ? (
                      <StatusBadge label="role≠admin" tone="warning" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {adminUser.email ?? profile?.email ?? "-"} ·{" "}
                    {formatDateTime(adminUser.created_at)}
                  </p>
                </div>
                {!isSelf ? (
                  <ConfirmButton
                    action={toggleAdminActive.bind(null, adminUser.id, !adminUser.is_active)}
                    tone={adminUser.is_active ? "danger" : "positive"}
                    confirmMessage={
                      adminUser.is_active
                        ? "이 관리자의 접근을 비활성화할까요?"
                        : "이 관리자의 접근을 활성화할까요?"
                    }
                  >
                    {adminUser.is_active ? "비활성화" : "활성화"}
                  </ConfirmButton>
                ) : null}
              </div>
            );
          })
        ) : (
          <EmptyRow message="등록된 관리자가 없습니다." />
        )}
      </div>

      <Card>
        <h2 className="font-semibold text-foreground">관리자 추가</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          추가할 사용자는 먼저 사용자 사이트에 카카오로 로그인한 적이 있어야 합니다.
        </p>
        <div className="mt-4">
          <AddAdminForm />
        </div>
      </Card>
    </div>
  );
}
