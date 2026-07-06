import { notFound } from "next/navigation";
import {
  formatDateTime,
  SUBMISSION_STATUS_LABELS,
  type ResourceSubmission,
} from "@actone/shared";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { SubmissionReviewForm } from "./submission-review-form";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("resource_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const submission = data as ResourceSubmission | null;
  if (!submission) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="자료 제보 상세" />

      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <StatusBadge
            label={SUBMISSION_STATUS_LABELS[submission.status] ?? submission.status}
            tone={
              submission.status === "pending"
                ? "warning"
                : submission.status === "approved"
                  ? "positive"
                  : "negative"
            }
          />
          <span>접수: {formatDateTime(submission.created_at)}</span>
          {submission.reviewed_at ? (
            <span>검토: {formatDateTime(submission.reviewed_at)}</span>
          ) : null}
        </div>
        <h2 className="mt-3 text-lg font-bold text-foreground">{submission.title}</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {submission.content}
        </p>
        {submission.source_url ? (
          <a
            href={submission.source_url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block text-sm text-accent-soft underline underline-offset-4"
          >
            출처: {submission.source_url}
          </a>
        ) : null}
        {submission.submission_reason ? (
          <p className="mt-3 rounded-lg border bg-background px-3 py-2 text-sm text-muted">
            제보 이유: {submission.submission_reason}
          </p>
        ) : null}
        {submission.admin_note ? (
          <p className="mt-3 rounded-lg border bg-background px-3 py-2 text-sm text-muted">
            관리자 메모: {submission.admin_note}
          </p>
        ) : null}
      </Card>

      {submission.status === "pending" ? (
        <Card>
          <h2 className="font-semibold text-foreground">제보 검토</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            승인하면 자료실에 &lsquo;액트원 운영진&rsquo; 명의의 게시글이 자동으로 생성됩니다.
          </p>
          <div className="mt-4">
            <SubmissionReviewForm submissionId={submission.id} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
