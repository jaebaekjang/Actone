"use client";

import { useActionState } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { saveNotice, type ActionState } from "@/lib/actions";

export function NoticeForm({
  postId,
  defaults,
}: {
  postId: string | null;
  defaults?: { title: string; content: string; is_pinned: boolean };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveNotice.bind(null, postId),
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={defaults?.title ?? ""} />
      </div>
      <div>
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          name="content"
          className="min-h-48"
          defaultValue={defaults?.content ?? ""}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="is_pinned"
          defaultChecked={defaults?.is_pinned ?? false}
          className="h-4 w-4 accent-[#f97316]"
        />
        커뮤니티 홈 상단 고정
      </label>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중…" : postId ? "공지 수정" : "공지 등록"}
      </Button>
    </form>
  );
}
