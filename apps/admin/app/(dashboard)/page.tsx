import Link from "next/link";
import { formatDateTime, REPORT_STATUS_LABELS, type Post, type Report } from "@actone/shared";
import { Card, EmptyRow, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function kstDayStartISO(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600_000);
  return new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) - 9 * 3600_000,
  ).toISOString();
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const todayStart = kstDayStartISO();

  const [
    totalMembers,
    todayMembers,
    totalPosts,
    todayPosts,
    pendingReports,
    pendingSubmissions,
    recentReports,
    recentPosts,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .neq("status", "deleted"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("resource_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "전체 회원", value: totalMembers.count ?? 0, href: "/members" },
    { label: "오늘 가입", value: todayMembers.count ?? 0, href: "/members" },
    { label: "전체 게시글", value: totalPosts.count ?? 0, href: "/posts" },
    { label: "오늘 게시글", value: todayPosts.count ?? 0, href: "/posts" },
    { label: "대기 중 신고", value: pendingReports.count ?? 0, href: "/reports" },
    { label: "대기 중 자료 제보", value: pendingSubmissions.count ?? 0, href: "/submissions" },
  ];

  const reports = (recentReports.data as Report[] | null) ?? [];
  const posts = (recentPosts.data as Post[] | null) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="대시보드" description="액트원 커뮤니티 현황" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-4 transition-colors hover:border-accent/40">
              <p className="text-xs text-muted">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="font-semibold text-foreground">최근 신고</h2>
        <div className="mt-3 space-y-2">
          {reports.length > 0 ? (
            reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3 text-sm hover:border-accent/40"
              >
                <span className="truncate text-foreground">
                  [{report.target_type === "post" ? "게시글" : "댓글"}] {report.reason}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <StatusBadge
                    label={REPORT_STATUS_LABELS[report.status] ?? report.status}
                    tone={
                      report.status === "pending"
                        ? "warning"
                        : report.status === "resolved"
                          ? "positive"
                          : "neutral"
                    }
                  />
                  <span className="text-xs text-muted">{formatDateTime(report.created_at)}</span>
                </span>
              </Link>
            ))
          ) : (
            <EmptyRow message="신고 내역이 없습니다." />
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-foreground">최근 게시글</h2>
        <div className="mt-3 space-y-2">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3 text-sm"
              >
                <span className="truncate text-foreground">{post.title}</span>
                <span className="shrink-0 text-xs text-muted">
                  {formatDateTime(post.created_at)}
                </span>
              </div>
            ))
          ) : (
            <EmptyRow message="게시글이 없습니다." />
          )}
        </div>
      </section>
    </div>
  );
}
