"use client";

import { useActionState } from "react";
import { Button, Label, Textarea } from "@/components/ui";
import { resolveReport, type ActionState } from "@/lib/actions";

export function ReportReviewForm({ reportId }: { reportId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resolveReport.bind(null, reportId),
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10">
          <input type="radio" name="decision" value="resolved" className="accent-[#f97316]" />
          신고 인정 (처리 완료)
        </label>
        <label className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10">
          <input type="radio" name="decision" value="dismissed" className="accent-[#f97316]" />
          기각
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="hide_target" className="h-4 w-4 accent-[#f97316]" />
        신고 인정 시 대상 콘텐츠 숨김 처리
      </label>

      <div>
        <Label htmlFor="admin_note">관리자 메모</Label>
        <Textarea id="admin_note" name="admin_note" placeholder="처리 사유나 메모를 남겨주세요." />
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "처리 중…" : "처리하기"}
      </Button>
    </form>
  );
}
