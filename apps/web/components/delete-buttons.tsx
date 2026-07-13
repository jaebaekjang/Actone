"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/lib/actions/posts";
import { deleteComment } from "@/lib/actions/engagement";

export function DeletePostButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("이 글을 삭제할까요? 삭제된 글은 목록에서 보이지 않습니다.")) {
          startTransition(() => deletePost(postId));
        }
      }}
      className="inline-flex items-center gap-1 text-sm text-muted hover:text-danger-soft disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
      삭제
    </button>
  );
}

export function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("댓글을 삭제할까요?")) {
          startTransition(() => deleteComment(commentId, postId));
        }
      }}
      className="text-xs text-muted hover:text-danger-soft disabled:opacity-60"
    >
      삭제
    </button>
  );
}
