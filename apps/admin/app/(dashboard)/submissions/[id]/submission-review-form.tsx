"use client";

import { useActionState } from "react";
import { Button, Label, Textarea } from "@/components/ui";
import { reviewSubmission, type ActionState } from "@/lib/actions";

export function SubmissionReviewForm({ submissionId }: { submissionId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    reviewSubmission.bind(null, submissionId),
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10">
          <input type="radio" name="decision" value="approved" className="accent-[#f97316]" />
          승인 (자료실에 게시)
        </label>
        <label className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10">
          <input type="radio" name="decision" value="rejected" className="accent-[#f97316]" />
          반려
        </label>
      </div>

      <div>
        <Label htmlFor="admin_note">관리자 메모 (반려 시 사유)</Label>
        <Textarea id="admin_note" name="admin_note" placeholder="검토 메모를 남겨주세요." />
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "처리 중…" : "검토 완료"}
      </Button>
    </form>
  );
}
