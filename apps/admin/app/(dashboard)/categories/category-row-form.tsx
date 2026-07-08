"use client";

import { useActionState } from "react";
import type { Category } from "@actone/shared";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { updateCategory, type ActionState } from "@/lib/actions";

export function CategoryRowForm({ category }: { category: Category }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCategory.bind(null, category.id),
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <div>
          <Label htmlFor={`name-${category.id}`}>이름</Label>
          <Input id={`name-${category.id}`} name="name" defaultValue={category.name} />
        </div>
        <div>
          <Label htmlFor={`sort-${category.id}`}>정렬 순서</Label>
          <Input
            id={`sort-${category.id}`}
            name="sort_order"
            type="number"
            min={0}
            defaultValue={category.sort_order}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`desc-${category.id}`}>설명</Label>
        <Textarea
          id={`desc-${category.id}`}
          name="description"
          className="min-h-16"
          defaultValue={category.description ?? ""}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={category.is_active}
            className="h-4 w-4 accent-[#f97316]"
          />
          활성화
        </label>
        <div className="flex items-center gap-3">
          {state.error ? <span className="text-xs text-danger">{state.error}</span> : null}
          {state.success ? (
            <span className="text-xs text-success">{state.success}</span>
          ) : null}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "저장 중…" : "저장"}
          </Button>
        </div>
      </div>
    </form>
  );
}
