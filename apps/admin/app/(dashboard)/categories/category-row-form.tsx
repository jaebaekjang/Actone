"use client";

import { useActionState } from "react";
import { BOARD_LEVEL_LABELS, type Category } from "@actone/shared";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { updateCategory, type ActionState } from "@/lib/actions";

const READ_OPTS = ["guest", "new_member", "regular_member", "tutor"] as const;
const WRITE_OPTS = ["new_member", "regular_member", "tutor", "admin"] as const;

function Check({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[#f97316]"
      />
      {label}
    </label>
  );
}

export function CategoryRowForm({ category }: { category: Category }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCategory.bind(null, category.id),
    {},
  );
  const uid = category.id.slice(0, 8);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[80px_1fr_100px]">
        <div>
          <Label htmlFor={`icon-${uid}`}>아이콘</Label>
          <Input id={`icon-${uid}`} name="icon" defaultValue={category.icon ?? ""} placeholder="🎭" />
        </div>
        <div>
          <Label htmlFor={`name-${uid}`}>이름</Label>
          <Input id={`name-${uid}`} name="name" defaultValue={category.name} />
        </div>
        <div>
          <Label htmlFor={`sort-${uid}`}>정렬</Label>
          <Input
            id={`sort-${uid}`}
            name="sort_order"
            type="number"
            min={0}
            defaultValue={category.sort_order}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`intro-${uid}`}>소개 문구</Label>
        <Textarea
          id={`intro-${uid}`}
          name="intro"
          className="min-h-16"
          defaultValue={category.intro ?? ""}
          placeholder="게시판 상단에 노출되는 안내 문구"
        />
      </div>
      <input type="hidden" name="description" value={category.description ?? ""} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`read-${uid}`}>열람 등급</Label>
          <Select id={`read-${uid}`} name="read_level" defaultValue={category.read_level}>
            {READ_OPTS.map((l) => (
              <option key={l} value={l}>
                {BOARD_LEVEL_LABELS[l]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`write-${uid}`}>글쓰기 등급</Label>
          <Select id={`write-${uid}`} name="write_level" defaultValue={category.write_level}>
            {WRITE_OPTS.map((l) => (
              <option key={l} value={l}>
                {BOARD_LEVEL_LABELS[l]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`comment-${uid}`}>댓글 등급</Label>
          <Select id={`comment-${uid}`} name="comment_level" defaultValue={category.comment_level}>
            {WRITE_OPTS.map((l) => (
              <option key={l} value={l}>
                {BOARD_LEVEL_LABELS[l]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
        <div>
          <Label htmlFor={`imgs-${uid}`}>이미지 최대</Label>
          <Input
            id={`imgs-${uid}`}
            name="max_images"
            type="number"
            min={0}
            max={10}
            defaultValue={category.max_images}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
          <Check name="is_active" label="활성화" defaultChecked={category.is_active} />
          <Check name="allow_tags" label="태그 사용" defaultChecked={category.allow_tags} />
          <Check name="is_anonymous" label="익명" defaultChecked={category.is_anonymous} />
          <Check
            name="requires_approval"
            label="승인 후 공개"
            defaultChecked={category.requires_approval}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {state.error ? <span className="text-xs text-red-400">{state.error}</span> : null}
        {state.success ? <span className="text-xs text-emerald-400">{state.success}</span> : null}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </Button>
      </div>
    </form>
  );
}
