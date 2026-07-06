import Link from "next/link";
import {
  formatDateTime,
  SUBMISSION_STATUS_LABELS,
  type ResourceSubmission,
} from "@actone/shared";
import { EmptyRow, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function SubmissionsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("resource_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query = query.eq("status", status);
  }
  const { data } = await query;
  const submissions = (data as ResourceSubmission[] | null) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="자료 제보 관리"
        description="회원 제보는 승인해야만 자료실에 게시됩니다."
      />

      <div className="flex gap-1">
        {[
          { value: "", label: "전체" },
          { value: "pending", label: "검토 대기" },
          { value: "approved", label: "승인" },
          { value: "rejected", label: "반려" },
        ].map((option) => (
          <Link
            key={option.value}
            href={option.value ? `/submissions?status=${option.value}` : "/submissions"}
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
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/submissions/${submission.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3 hover:border-accent/40"
            >
              <div className="min-w-0">
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
                  <span>{formatDateTime(submission.created_at)}</span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {submission.title}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <EmptyRow message="자료 제보가 없습니다." />
        )}
      </div>
    </div>
  );
}
