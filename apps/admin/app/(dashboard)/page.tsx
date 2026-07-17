import Link from "next/link";
import {
  ADMIN_ACTIVITY_ACTION_LABELS,
  formatDateTime,
  MEMBER_LEVEL_LABELS,
  type AdminActivityLog,
} from "@actone/shared";
import { Card, EmptyRow, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function kstDayStartISO(offsetDays = 0): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600_000);
  return new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - offsetDays) -
      9 * 3600_000,
  ).toISOString();
}

async function distinctActiveCount(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  sinceISO: string,
): Promise<number> {
  const [{ data: posts }, { data: comments }] = await Promise.all([
    supabase.from("posts").select("author_id").gte("created_at", sinceISO).limit(5000),
    supabase.from("comments").select("author_id").gte("created_at", sinceISO).limit(5000),
  ]);
  const ids = new Set<string>();
  for (const r of (posts as { author_id: string | null }[] | null) ?? [])
    if (r.author_id) ids.add(r.author_id);
  for (const r of (comments as { author_id: string | null }[] | null) ?? [])
    if (r.author_id) ids.add(r.author_id);
  return ids.size;
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const todayStart = kstDayStartISO(0);
  const day7 = kstDayStartISO(7);
  const day30 = kstDayStartISO(30);

  const head = { count: "exact" as const, head: true };

  const [
    totalMembers,
    newLevel,
    regularLevel,
    tutorLevel,
    onboarded,
    todayMembers,
    todayPosts,
    todayComments,
    pendingReports,
    pendingSubmissions,
    active7,
    active30,
    recentActivity,
  ] = await Promise.all([
    supabase.from("profiles").select("id", head),
    supabase.from("profiles").select("id", head).eq("member_level", "new_member"),
    supabase.from("profiles").select("id", head).eq("member_level", "regular_member"),
    supabase.from("profiles").select("id", head).eq("member_level", "tutor"),
    supabase.from("profiles").select("id", head).eq("onboarding_completed", true),
    supabase.from("profiles").select("id", head).gte("created_at", todayStart),
    supabase.from("posts").select("id", head).gte("created_at", todayStart).neq("status", "deleted"),
    supabase
      .from("comments")
      .select("id", head)
      .gte("created_at", todayStart)
      .neq("status", "deleted"),
    supabase.from("reports").select("id", head).eq("status", "pending"),
    supabase.from("resource_submissions").select("id", head).eq("status", "pending"),
    distinctActiveCount(supabase, day7),
    distinctActiveCount(supabase, day30),
    supabase
      .from("admin_activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const total = totalMembers.count ?? 0;
  const nNew = newLevel.count ?? 0;
  const nRegular = regularLevel.count ?? 0;
  const nTutor = tutorLevel.count ?? 0;
  const nOnboarded = onboarded.count ?? 0;

  const kpis = [
    { label: "전체 회원", value: total, href: "/members" },
    { label: "신규회원", value: nNew, href: "/members" },
    { label: "정회원", value: nRegular, href: "/members" },
    { label: "튜터", value: nTutor, href: "/members" },
    { label: "오늘 가입", value: todayMembers.count ?? 0, href: "/members" },
    { label: "7일 활성", value: active7, href: "/members" },
    { label: "30일 활성", value: active30, href: "/members" },
    { label: "오늘 게시글", value: todayPosts.count ?? 0, href: "/posts" },
    { label: "오늘 댓글", value: todayComments.count ?? 0, href: "/comments" },
    { label: "미처리 신고", value: pendingReports.count ?? 0, href: "/reports", alert: true },
    { label: "자료 승인 대기", value: pendingSubmissions.count ?? 0, href: "/submissions", alert: true },
    { label: "온보딩 완료", value: nOnboarded, href: "/members" },
  ];

  // conversion funnel (counts, descending)
  const funnel = [
    { label: "회원가입", value: total },
    { label: "온보딩 완료", value: nOnboarded },
    { label: "정회원 이상", value: nRegular + nTutor },
    { label: "튜터", value: nTutor },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.value));

  const levelDist = [
    { label: MEMBER_LEVEL_LABELS.new_member, value: nNew, tone: "bg-muted/50" },
    { label: MEMBER_LEVEL_LABELS.regular_member, value: nRegular, tone: "bg-accent/60" },
    { label: MEMBER_LEVEL_LABELS.tutor, value: nTutor, tone: "bg-gold/70" },
  ];

  const tasks = [
    { label: "미처리 신고", value: pendingReports.count ?? 0, href: "/reports" },
    { label: "자료 승인 대기", value: pendingSubmissions.count ?? 0, href: "/submissions" },
  ].filter((t) => t.value > 0);

  const logs = (recentActivity.data as AdminActivityLog[] | null) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="대시보드" description="액트원 커뮤니티 운영 현황" />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="p-4 transition-colors hover:border-accent/40">
              <p className="text-xs text-muted">{kpi.label}</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  kpi.alert && kpi.value > 0 ? "text-amber-400" : "text-foreground"
                }`}
              >
                {kpi.value.toLocaleString()}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* funnel */}
        <section>
          <h2 className="font-semibold text-foreground">전환 퍼널</h2>
          <Card className="mt-3 space-y-3">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted">{f.label}</span>
                  <span className="font-medium text-foreground">
                    {f.value.toLocaleString()}
                    <span className="ml-1 text-muted">
                      ({total > 0 ? Math.round((f.value / total) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(f.value / funnelMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* level distribution */}
        <section>
          <h2 className="font-semibold text-foreground">회원 등급 분포</h2>
          <Card className="mt-3 space-y-3">
            {levelDist.map((d) => (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted">{d.label}</span>
                  <span className="font-medium text-foreground">
                    {d.value.toLocaleString()}
                    <span className="ml-1 text-muted">
                      ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className={`h-full rounded-full ${d.tone}`}
                    style={{ width: `${total > 0 ? (d.value / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* today's tasks */}
        <section>
          <h2 className="font-semibold text-foreground">오늘 처리할 업무</h2>
          <div className="mt-3 space-y-2">
            {tasks.length > 0 ? (
              tasks.map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="flex items-center justify-between rounded-lg border bg-surface px-4 py-3 text-sm hover:border-accent/40"
                >
                  <span className="text-foreground">{t.label}</span>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                    {t.value}건
                  </span>
                </Link>
              ))
            ) : (
              <EmptyRow message="처리할 업무가 없습니다." />
            )}
          </div>
        </section>

        {/* recent admin activity */}
        <section>
          <h2 className="font-semibold text-foreground">최근 관리자 활동</h2>
          <div className="mt-3 space-y-2">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-2.5 text-sm"
                >
                  <span className="truncate text-foreground">
                    {ADMIN_ACTIVITY_ACTION_LABELS[log.action] ?? log.action}
                    {log.summary ? (
                      <span className="ml-1.5 text-muted">· {log.summary}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <EmptyRow message="활동 내역이 없습니다." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
