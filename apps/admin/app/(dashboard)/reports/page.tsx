import Link from "next/link";
import {
  formatDateTime,
  REPORT_STATUS_LABELS,
  type Report,
} from "@actone/shared";
import { EmptyRow, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function ReportsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && ["pending", "resolved", "dismissed"].includes(status)) {
    query = query.eq("status", status);
  }
  const { data } = await query;
  const reports = (data as Report[] | null) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="신고 관리" />

      <div className="flex gap-1">
        {[
          { value: "", label: "전체" },
          { value: "pending", label: "대기" },
          { value: "resolved", label: "처리 완료" },
          { value: "dismissed", label: "기각" },
        ].map((option) => (
          <Link
            key={option.value}
            href={option.value ? `/reports?status=${option.value}` : "/reports"}
            className={`rounded-full px-3 py-1.5 text-sm ${
              (status ?? "") === option.value
                ? "bg-accent/15 font-medium text-accent-soft"
                : "text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {reports.length > 0 ? (
          reports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3 hover:border-accent/40"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <StatusBadge
                    label={report.target_type === "post" ? "게시글" : "댓글"}
                    tone="neutral"
                  />
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
                  <span>{formatDateTime(report.created_at)}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{report.reason}</p>
                {report.detail ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{report.detail}</p>
                ) : null}
              </div>
            </Link>
          ))
        ) : (
          <EmptyRow message="신고 내역이 없습니다." />
        )}
      </div>
    </div>
  );
}
