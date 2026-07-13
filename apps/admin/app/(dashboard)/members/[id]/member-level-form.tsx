"use client";

import { useActionState } from "react";
import { MEMBER_LEVEL_LABELS, MEMBER_LEVELS, type MemberLevel } from "@actone/shared";
import { Button, Input, Label, Select } from "@/components/ui";
import { setMemberLevel, type ActionState } from "@/lib/actions";

export function MemberLevelForm({
  userId,
  currentLevel,
}: {
  userId: string;
  currentLevel: MemberLevel;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setMemberLevel.bind(null, userId),
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="member_level">새 등급</Label>
        <Select id="member_level" name="member_level" defaultValue={currentLevel}>
          {MEMBER_LEVELS.map((level) => (
            <option key={level} value={level}>
              {MEMBER_LEVEL_LABELS[level]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="reason">변경 사유</Label>
        <Input id="reason" name="reason" placeholder="예: 오프라인 모임 3회 참석 확인" />
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "변경 중…" : "등급 변경"}
      </Button>
    </form>
  );
}
