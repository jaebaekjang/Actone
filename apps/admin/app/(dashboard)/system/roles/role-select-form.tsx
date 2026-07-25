"use client";

import { useActionState } from "react";
import { ADMIN_ROLE_LABELS } from "@actone/shared";
import { Button, Select } from "@/components/ui";
import { setAdminRole, type ActionState } from "@/lib/actions";

const ROLE_KEYS = Object.keys(ADMIN_ROLE_LABELS);

export function RoleSelectForm({
  adminUserId,
  currentRole,
  disabled,
}: {
  adminUserId: string;
  currentRole: string;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setAdminRole.bind(null, adminUserId),
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Select
        name="role_key"
        defaultValue={currentRole}
        disabled={disabled || pending}
        className="h-9 w-44"
      >
        {ROLE_KEYS.map((key) => (
          <option key={key} value={key}>
            {ADMIN_ROLE_LABELS[key]}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary" size="sm" disabled={disabled || pending}>
        {pending ? "변경 중…" : "변경"}
      </Button>
      {state.error ? <span className="text-xs text-red-400">{state.error}</span> : null}
      {state.success ? <span className="text-xs text-emerald-400">{state.success}</span> : null}
    </form>
  );
}
