import { notFound } from "next/navigation";
import {
  formatDateTime,
  MEMBER_LEVEL_LABELS,
  ROLE_LABELS,
  type MemberLevelLog,
  type Profile,
} from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { Card, MemberLevelBadge, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { setSuspension } from "@/lib/actions";
import { MemberLevelForm } from "./member-level-form";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const member = data as Profile | null;
  if (!member) notFound();

  const [postCountRes, commentCountRes, logsRes, postIdsRes, commentIdsRes] =
    await Promise.all([
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", id)
        .neq("status", "deleted"),
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("author_id", id)
        .neq("status", "deleted"),
      supabase
        .from("member_level_logs")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("posts").select("id").eq("author_id", id).limit(1000),
      supabase.from("comments").select("id").eq("author_id", id).limit(1000),
    ]);

  const targetIds = [
    ...(((postIdsRes.data as { id: string }[] | null) ?? []).map((r) => r.id)),
    ...(((commentIdsRes.data as { id: string }[] | null) ?? []).map((r) => r.id)),
  ];
  let receivedReports = 0;
  if (targetIds.length > 0) {
    const { count } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .in("target_id", targetIds);
    receivedReports = count ?? 0;
  }

  const logs = (logsRes.data as MemberLevelLog[] | null) ?? [];
  const suspendBound = setSuspension.bind(null, id, !member.is_suspended);

  return (
    <div className="space-y-6">
      <PageHeader
        title={member.nickname ?? "(온보딩 미완료)"}
        description={member.email ?? undefined}
        action={
          <ConfirmButton
            action={suspendBound}
            tone={member.is_suspended ? "positive" : "danger"}
            confirmMessage={
              member.is_suspended
                ? "이 회원의 정지를 해제할까요?"
                : "이 회원을 정지할까요? 정지된 회원은 글/댓글/좋아요/신고 등을 사용할 수 없습니다."
            }
          >
            {member.is_suspended ? "정지 해제" : "회원 정지"}
          </ConfirmButton>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-foreground">기본 정보</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">역할</dt>
              <dd>
                <StatusBadge
                  label={ROLE_LABELS[member.role] ?? member.role}
                  tone={member.role === "admin" ? "warning" : "neutral"}
                />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">회원 등급</dt>
              <dd>
                <MemberLevelBadge level={member.member_level} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">계정 상태</dt>
              <dd>
                {member.is_suspended ? (
                  <StatusBadge label="정지" tone="negative" />
                ) : (
                  <StatusBadge label="정상" tone="positive" />
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">배우 상태</dt>
              <dd className="text-foreground">{member.actor_status ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">활동 분야</dt>
              <dd className="text-foreground">{member.activity_field ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">지역</dt>
              <dd className="text-foreground">{member.region ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">가입일</dt>
              <dd className="text-foreground">{formatDateTime(member.created_at)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">작성 글</dt>
              <dd className="text-foreground">{postCountRes.count ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">작성 댓글</dt>
              <dd className="text-foreground">{commentCountRes.count ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">받은 신고</dt>
              <dd className="text-foreground">{receivedReports}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-semibold text-foreground">회원 등급 변경</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            튜터는 여기서만(수동으로만) 지정할 수 있습니다. 모든 변경은 로그에 기록됩니다.
          </p>
          <div className="mt-4">
            <MemberLevelForm userId={member.id} currentLevel={member.member_level} />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-foreground">등급 변경 이력</h2>
        <div className="mt-3 space-y-2">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm"
              >
                <span className="text-foreground">
                  {log.previous_level
                    ? (MEMBER_LEVEL_LABELS[log.previous_level as keyof typeof MEMBER_LEVEL_LABELS] ?? log.previous_level)
                    : "-"}
                  {" → "}
                  {MEMBER_LEVEL_LABELS[log.new_level as keyof typeof MEMBER_LEVEL_LABELS] ?? log.new_level}
                  <StatusBadge
                    label={log.change_type === "manual" ? "수동" : "자동"}
                    tone={log.change_type === "manual" ? "neutral" : "warning"}
                  />
                </span>
                <span className="text-xs text-muted">
                  {log.reason ? `${log.reason} · ` : ""}
                  {formatDateTime(log.created_at)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">등급 변경 이력이 없습니다.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
