import { notFound } from "next/navigation";
import {
  formatDateTime,
  POST_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  type Comment,
  type Post,
  type Report,
} from "@actone/shared";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { ReportReviewForm } from "./report-review-form";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
  const report = data as Report | null;
  if (!report) notFound();

  let targetPost: Post | null = null;
  let targetComment: Comment | null = null;
  if (report.target_type === "post") {
    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .eq("id", report.target_id)
      .maybeSingle();
    targetPost = postData as Post | null;
  } else {
    const { data: commentData } = await supabase
      .from("comments")
      .select("*")
      .eq("id", report.target_id)
      .maybeSingle();
    targetComment = commentData as Comment | null;
  }

  const targetStatus = targetPost?.status ?? targetComment?.status;

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="신고 상세" />

      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <StatusBadge
            label={report.target_type === "post" ? "게시글 신고" : "댓글 신고"}
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
          <span>접수: {formatDateTime(report.created_at)}</span>
          {report.resolved_at ? <span>처리: {formatDateTime(report.resolved_at)}</span> : null}
        </div>
        <p className="mt-3 font-semibold text-foreground">{report.reason}</p>
        {report.detail ? (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {report.detail}
          </p>
        ) : null}
        {report.admin_note ? (
          <p className="mt-3 rounded-lg border bg-background px-3 py-2 text-sm text-muted">
            관리자 메모: {report.admin_note}
          </p>
        ) : null}
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          신고 대상 콘텐츠
          {targetStatus ? (
            <StatusBadge
              label={POST_STATUS_LABELS[targetStatus] ?? targetStatus}
              tone={
                targetStatus === "published"
                  ? "positive"
                  : targetStatus === "hidden"
                    ? "warning"
                    : "negative"
              }
            />
          ) : null}
        </h2>
        {targetPost ? (
          <div className="mt-3">
            <p className="font-medium text-foreground">{targetPost.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
              {targetPost.content}
            </p>
          </div>
        ) : targetComment ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
            {targetComment.content}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">대상 콘텐츠를 찾을 수 없습니다.</p>
        )}
      </Card>

      {report.status === "pending" ? (
        <Card>
          <h2 className="font-semibold text-foreground">신고 처리</h2>
          <div className="mt-4">
            <ReportReviewForm reportId={report.id} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
