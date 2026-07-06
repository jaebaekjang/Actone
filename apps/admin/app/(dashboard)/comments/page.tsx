import {
  formatDateTime,
  POST_STATUS_LABELS,
  type Comment,
} from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyRow, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { setCommentStatus } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function CommentsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status && ["published", "hidden", "deleted"].includes(status)) {
    query = query.eq("status", status);
  }
  if (q?.trim()) {
    const term = q.trim().replaceAll(",", " ").replaceAll("%", "");
    query = query.ilike("content", `%${term}%`);
  }
  const { data } = await query;
  const comments = (data as Comment[] | null) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="댓글 관리" />

      <form className="flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="댓글 내용 검색"
          className="h-10 w-full max-w-xs rounded-lg border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-lg border bg-surface px-3 text-sm text-foreground"
        >
          <option value="">전체 상태</option>
          <option value="published">게시됨</option>
          <option value="hidden">숨김</option>
          <option value="deleted">삭제됨</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
        >
          검색
        </button>
      </form>

      <div className="space-y-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <StatusBadge
                    label={POST_STATUS_LABELS[comment.status] ?? comment.status}
                    tone={
                      comment.status === "published"
                        ? "positive"
                        : comment.status === "hidden"
                          ? "warning"
                          : "negative"
                    }
                  />
                  <span>{formatDateTime(comment.created_at)}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-foreground">{comment.content}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {comment.status !== "published" ? (
                  <ConfirmButton
                    action={setCommentStatus.bind(null, comment.id, "published")}
                    tone="positive"
                  >
                    복구
                  </ConfirmButton>
                ) : null}
                {comment.status !== "hidden" ? (
                  <ConfirmButton action={setCommentStatus.bind(null, comment.id, "hidden")}>
                    숨김
                  </ConfirmButton>
                ) : null}
                {comment.status !== "deleted" ? (
                  <ConfirmButton
                    action={setCommentStatus.bind(null, comment.id, "deleted")}
                    tone="danger"
                    confirmMessage="이 댓글을 삭제 처리할까요?"
                  >
                    삭제
                  </ConfirmButton>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyRow message="조건에 맞는 댓글이 없습니다." />
        )}
      </div>
    </div>
  );
}
