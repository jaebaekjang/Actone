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
import { MemberLevelBadge, PageHeader, StatusBadge } from "@/components/ui";
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-foreground">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 border-b pb-2 font-semibold text-foreground">{children}</h2>
  );
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
    <div className="max-w-4xl space-y-8">
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

      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
        <section>
          <SectionTitle>기본 정보</SectionTitle>
          <dl className="divide-y text-sm">
            <Row label="역할">
              <StatusBadge
                label={ROLE_LABELS[member.role] ?? member.role}
                tone={member.role === "admin" ? "warning" : "neutral"}
              />
            </Row>
            <Row label="회원 등급">
              <MemberLevelBadge level={member.member_level} />
            </Row>
            <Row label="계정 상태">
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
            </Row>
            <Row label="누적 경고">{member.warning_count}회</Row>
            <Row label="배우 상태">{member.actor_status ?? "-"}</Row>
            <Row label="활동 분야">{member.activity_field ?? "-"}</Row>
            <Row label="지역">{member.region ?? "-"}</Row>
            <Row label="가입일">{formatDateTime(member.created_at)}</Row>
            <Row label="작성 글">{postCountRes.count ?? 0}</Row>
            <Row label="작성 댓글">{commentCountRes.count ?? 0}</Row>
            <Row label="받은 신고">{receivedReports}</Row>
          </dl>
        </section>

        <section>
          <SectionTitle>회원 등급 변경</SectionTitle>
          <p className="mb-4 text-xs leading-relaxed text-muted">
            튜터는 여기서만(수동으로만) 지정할 수 있습니다. 모든 변경은 로그에 기록됩니다.
          </p>
          <MemberLevelForm userId={member.id} currentLevel={member.member_level} />
        </section>
      </div>

      {canSuspend ? (
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
          <section>
            <SectionTitle>경고</SectionTitle>
            <p className="mb-4 text-xs text-muted">경고는 누적되며 운영자 메모에도 자동 기록됩니다.</p>
            <WarningForm userId={member.id} />
          </section>
          <section>
            <SectionTitle>기간 정지</SectionTitle>
            <p className="mb-4 text-xs text-muted">
              정지 기간이 지나도 자동 해제되지 않습니다. 만료일은 참고용이며 해제는 상단 버튼으로 진행합니다.
            </p>
            <SuspensionForm userId={member.id} />
          </section>
        </div>
      ) : null}

      {hasUtm ? (
        <section>
          <SectionTitle>유입 정보 (UTM)</SectionTitle>
          <dl className="grid gap-x-10 text-sm sm:grid-cols-2">
            <Row label="Source">{member.utm_source ?? "-"}</Row>
            <Row label="Medium">{member.utm_medium ?? "-"}</Row>
            <Row label="Campaign">{member.utm_campaign ?? "-"}</Row>
            <Row label="Referrer">
              <span className="block max-w-[220px] truncate">{member.referrer ?? "-"}</span>
            </Row>
          </dl>
        </section>
      ) : null}

      <section>
        <SectionTitle>등급 변경 이력</SectionTitle>
        {logs.length > 0 ? (
          <ul className="divide-y text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="flex items-center gap-2 text-foreground">
                  {log.previous_level
                    ? MEMBER_LEVEL_LABELS[log.previous_level as keyof typeof MEMBER_LEVEL_LABELS] ??
                      log.previous_level
                    : "-"}
                  {" → "}
                  {MEMBER_LEVEL_LABELS[log.new_level as keyof typeof MEMBER_LEVEL_LABELS] ??
                    log.new_level}
                  <StatusBadge
                    label={log.change_type === "manual" ? "수동" : "자동"}
                    tone={log.change_type === "manual" ? "neutral" : "warning"}
                  />
                </span>
                <span className="text-xs text-muted">
                  {log.reason ? `${log.reason} · ` : ""}
                  {formatDateTime(log.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">등급 변경 이력이 없습니다.</p>
        )}
      </section>

      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
        <section>
          <SectionTitle>최근 게시글</SectionTitle>
          {recentPosts.length > 0 ? (
            <ul className="divide-y text-sm">
              {recentPosts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="flex items-center justify-between gap-3 py-2 hover:text-accent-soft"
                  >
                    <span className="truncate text-foreground">{p.title}</span>
                    <span className="shrink-0 text-xs text-muted">{formatDate(p.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">작성한 게시글이 없습니다.</p>
          )}
        </section>
        <section>
          <SectionTitle>최근 댓글</SectionTitle>
          {recentComments.length > 0 ? (
            <ul className="divide-y text-sm">
              {recentComments.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/posts/${c.post_id}`}
                    className="flex items-center justify-between gap-3 py-2 hover:text-accent-soft"
                  >
                    <span className="truncate text-foreground">{c.content}</span>
                    <span className="shrink-0 text-xs text-muted">{formatDate(c.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">작성한 댓글이 없습니다.</p>
          )}
        </section>
      </div>

      <section>
        <SectionTitle>운영자 메모</SectionTitle>
        <NoteForm userId={member.id} />
        <ul className="mt-4 divide-y text-sm">
          {notes.length > 0 ? (
            notes.map((note) => (
              <li key={note.id} className="py-2.5">
                <p className="whitespace-pre-wrap text-foreground">{note.body}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(note.created_at)}</p>
              </li>
            ))
          ) : (
            <li className="py-2.5 text-muted">메모가 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
