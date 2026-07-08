"use client";

import { useRef, useState, useTransition } from "react";
import { createComment } from "@/lib/actions/engagement";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";

export function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(undefined);
        startTransition(async () => {
          const result = await createComment(postId, {}, formData);
          if (result.error) {
            setError(result.error);
          } else {
            formRef.current?.reset();
          }
        });
      }}
      className="space-y-2"
    >
      <Textarea
        name="content"
        placeholder="따뜻하고 솔직한 댓글을 남겨주세요 (2~1000자)"
        maxLength={1000}
        required
      />
      {error ? <p className="text-sm text-danger-soft">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "등록 중…" : "댓글 등록"}
        </Button>
      </div>
    </form>
  );
}
