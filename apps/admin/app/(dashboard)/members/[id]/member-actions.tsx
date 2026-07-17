"use client";

import { useActionState } from "react";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import {
  addAdminNote,
  addWarning,
  setTimedSuspension,
  type ActionState,
} from "@/lib/actions";

export function WarningForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addWarning.bind(null, userId),
    {},
  );
  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="warn-reason">경고 사유</Label>
      <Input id="warn-reason" name="reason" placeholder="예: 반복적인 광고성 게시물" />
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "처리 중…" : "경고 부여"}
      </Button>
    </form>
  );
}

export function SuspensionForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setTimedSuspension.bind(null, userId),
    {},
  );
  return (
    <form action={formAction} className="space-y-2">
      <Label htmlFor="susp-days">정지 기간</Label>
      <Select id="susp-days" name="days" defaultValue="7">
        <option value="1">1일</option>
        <option value="3">3일</option>
        <option value="7">7일</option>
        <option value="30">30일</option>
        <option value="0">영구 정지</option>
      </Select>
      <Input name="reason" placeholder="정지 사유 (선택)" />
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}
      <Button type="submit" variant="danger" size="sm" disabled={pending}>
        {pending ? "처리 중…" : "기간 정지"}
      </Button>
    </form>
  );
}

export function NoteForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addAdminNote.bind(null, "profile", userId),
    {},
  );
  return (
    <form action={formAction} className="space-y-2">
      <Textarea name="body" placeholder="운영자 메모를 입력하세요 (회원에게 노출되지 않음)" />
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "저장 중…" : "메모 추가"}
      </Button>
    </form>
  );
}
