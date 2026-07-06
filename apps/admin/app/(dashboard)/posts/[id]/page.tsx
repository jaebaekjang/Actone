import { notFound } from "next/navigation";
import {
  formatDateTime,
  POST_STATUS_LABELS,
  type Post,
  type Profile,
} from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { setPostStatus } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PostContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  const post = data as Post | null;
  if (!post) notFound();

  let author: Profile | null = null;
  if (post.author_id) {
    const { data: authorData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", post.author_id)
      .maybeSingle();
    author = authorData as Profile | null;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="게시글 내용"
        action={
          <div className="flex gap-1.5">
            {post.status !== "published" ? (
              <ConfirmButton action={setPostStatus.bind(null, post.id, "published")} tone="positive">
                복구
              </ConfirmButton>
            ) : null}
            {post.status !== "hidden" ? (
              <ConfirmButton action={setPostStatus.bind(null, post.id, "hidden")}>숨김</ConfirmButton>
            ) : null}
            {post.status !== "deleted" ? (
              <ConfirmButton
                action={setPostStatus.bind(null, post.id, "deleted")}
                tone="danger"
                confirmMessage="이 글을 삭제 처리할까요?"
              >
                삭제
              </ConfirmButton>
            ) : null}
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <StatusBadge
            label={POST_STATUS_LABELS[post.status] ?? post.status}
            tone={
              post.status === "published"
                ? "positive"
                : post.status === "hidden"
                  ? "warning"
                  : "negative"
            }
          />
          <span>작성자: {author?.nickname ?? "액트원 운영진"}</span>
          <span>{formatDateTime(post.created_at)}</span>
          <span>
            조회 {post.view_count} · 좋아요 {post.like_count} · 댓글 {post.comment_count}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-bold text-foreground">{post.title}</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {post.content}
        </p>
      </Card>
    </div>
  );
}
