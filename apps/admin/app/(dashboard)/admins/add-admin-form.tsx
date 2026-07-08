"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { addAdminByEmail, type ActionState } from "@/lib/actions";

export function AddAdminForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addAdminByEmail,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="email">회원 이메일</Label>
        <Input id="email" name="email" type="email" placeholder="user@example.com" />
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "등록 중…" : "관리자로 등록"}
      </Button>
    </form>
  );
}
