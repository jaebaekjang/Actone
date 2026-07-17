import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDate,
  formatDateTime,
  MEMBER_LEVEL_LABELS,
  ROLE_LABELS,
  type AdminNote,
  type MemberLevelLog,
  type Profile,
} from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { Card, MemberLevelBadge, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { setSuspension } from "@/lib/actions";
import { MemberLevelForm } from "./member-level-form";
import { NoteForm, SuspensionForm, WarningForm } from "./member-actions";

export const dynamic = "force-dynamic";

interface MiniPost {
  id: string;
  title: string;
  status: string;
  created_at: string;
}
interface MiniComment {
  id: string;
  post_id: string;
  content: string;
  status: string;
  created_at: string;
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, can } = await requireAdmin();

  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const member = data as Profile | null;
  if (!member) notFound();

  const [
    postCountRes,
    commentCountRes,
    logsRes,
    postIdsRes,
    commentIdsRes,
    recentPostsRes,
    recentCommentsRes,
    notesRes,
  ] = await Promise.all([
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
    supabase
      .from("posts")
      .select("id, title, status, created_at")
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("comments")
      .select("id, post_id, content, status, created_at")
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("admin_notes")
      .select("*")
      .eq("target_type", "profile")
      .eq("target_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
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
  const recentPosts = (recentPostsRes.data as MiniPost[] | null) ?? [];
  const recentComments = (recentCommentsRes.data as MiniComment[] | null) ?? [];
  const notes = (notesRes.data as AdminNote[] | null) ?? [];
  const canSuspend = can("members.suspend");
  const hasUtm = Boolean(member.utm_source || member.utm_campaign || member.referrer);
  const suspendBound = setSuspension.bind(null, id, !member.is_suspended);

  return (
    <div className="space-y-6">
      <PageHeader
        title={member.nickname ?? "(온보딩 미완료)"}
        description={member.email ?? undefined}
        action={
          canSuspend ? (
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
          ) : undefined
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
                  <StatusBadge
                    label={
                      member.suspended_until
                        ? `정지 (~${formatDate(member.suspended_until)})`
                        : "영구 정지"
                    }
                    tone="negative"
                  />
                ) : (
                  <StatusBadge label="정상" tone="positive" />
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">누적 경고</dt>
              <dd className="text-foreground">{member.warning_count}회</dd>
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

      {canSuspend ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="font-semibold text-foreground">경고</h2>
            <p className="mt-1 text-xs text-muted">
              경고는 누적되며 운영자 메모에도 자동 기록됩니다.
            </p>
            <div className="mt-4">
              <WarningForm userId={member.id} />
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-foreground">기간 정지</h2>
            <p className="mt-1 text-xs text-muted">
              정지 기간이 지나도 자동 해제되지 않습니다. 만료일은 참고용이며 해제는 상단 버튼으로 진행합니다.
            </p>
            <div className="mt-4">
              <SuspensionForm userId={member.id} />
            </div>
          </Card>
        </div>
      ) : null}

      {hasUtm ? (
        <Card>
          <h2 className="font-semibold text-foreground">유입 정보 (UTM)</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Source</dt>
              <dd className="text-foreground">{member.utm_source ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Medium</dt>
              <dd className="text-foreground">{member.utm_medium ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Campaign</dt>
              <dd className="text-foreground">{member.utm_campaign ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Referrer</dt>
              <dd className="max-w-[60%] truncate text-foreground">{member.referrer ?? "-"}</dd>
            </div>
          </dl>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-foreground">최근 게시글</h2>
          <div className="mt-3 space-y-2">
            {recentPosts.length > 0 ? (
              recentPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/posts/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm hover:border-accent/40"
                >
                  <span className="truncate text-foreground">{p.title}</span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(p.created_at)}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted">작성한 게시글이 없습니다.</p>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-foreground">최근 댓글</h2>
          <div className="mt-3 space-y-2">
            {recentComments.length > 0 ? (
              recentComments.map((c) => (
                <Link
                  key={c.id}
                  href={`/posts/${c.post_id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm hover:border-accent/40"
                >
                  <span className="truncate text-foreground">{c.content}</span>
                  <span className="shrink-0 text-xs text-muted">{formatDate(c.created_at)}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted">작성한 댓글이 없습니다.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-foreground">운영자 메모</h2>
        <div className="mt-3">
          <NoteForm userId={member.id} />
        </div>
        <div className="mt-4 space-y-2">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="rounded-lg border bg-background px-3 py-2.5 text-sm">
                <p className="whitespace-pre-wrap text-foreground">{note.body}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(note.created_at)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">메모가 없습니다.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
