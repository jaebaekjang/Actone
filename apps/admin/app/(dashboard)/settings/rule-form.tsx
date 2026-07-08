"use client";

import { useActionState } from "react";
import type { RegularMemberRule } from "@actone/shared";
import { Button, Input, Label } from "@/components/ui";
import { saveRegularMemberRule, type ActionState } from "@/lib/actions";

export function RuleForm({ rule }: { rule: RegularMemberRule }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveRegularMemberRule,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="flex items-center gap-2.5 rounded-lg border bg-background px-4 py-3 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={rule.enabled}
          className="h-4 w-4 accent-[#f97316]"
        />
        정회원 자동 승급 활성화
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="minDaysAfterJoin">최소 가입 경과일</Label>
          <Input
            id="minDaysAfterJoin"
            name="minDaysAfterJoin"
            type="number"
            min={0}
            defaultValue={rule.minDaysAfterJoin}
          />
        </div>
        <div>
          <Label htmlFor="minPostCount">최소 게시글 수</Label>
          <Input
            id="minPostCount"
            name="minPostCount"
            type="number"
            min={0}
            defaultValue={rule.minPostCount}
          />
        </div>
        <div>
          <Label htmlFor="minCommentCount">최소 댓글 수</Label>
          <Input
            id="minCommentCount"
            name="minCommentCount"
            type="number"
            min={0}
            defaultValue={rule.minCommentCount}
          />
        </div>
        <div>
          <Label htmlFor="maxReceivedReports">허용 최대 신고 수</Label>
          <Input
            id="maxReceivedReports"
            name="maxReceivedReports"
            type="number"
            min={0}
            defaultValue={rule.maxReceivedReports}
          />
        </div>
      </div>

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중…" : "설정 저장"}
      </Button>
    </form>
  );
}
