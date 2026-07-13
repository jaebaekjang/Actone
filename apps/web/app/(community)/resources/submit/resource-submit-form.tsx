"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resourceSubmissionSchema,
  type ResourceSubmissionInput,
} from "@actone/shared";
import { submitResource } from "@/lib/actions/resources";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";

export function ResourceSubmitForm() {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();

  const form = useForm<ResourceSubmissionInput>({
    resolver: zodResolver(resourceSubmissionSchema),
    defaultValues: { title: "", content: "", source_url: "", submission_reason: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(undefined);
    const fd = new FormData();
    fd.set("title", values.title);
    fd.set("content", values.content);
    fd.set("source_url", values.source_url ?? "");
    fd.set("submission_reason", values.submission_reason ?? "");
    startTransition(async () => {
      const result = await submitResource({}, fd);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">자료 제목</Label>
        <Input id="title" placeholder="예: 오디션 지원 전 체크리스트" {...form.register("title")} />
        <FieldError message={form.formState.errors.title?.message} />
      </div>

      <div>
        <Label htmlFor="content">자료 내용</Label>
        <Textarea
          id="content"
          className="min-h-40"
          placeholder="자료의 내용이나 요약을 적어주세요."
          {...form.register("content")}
        />
        <FieldError message={form.formState.errors.content?.message} />
      </div>

      <div>
        <Label htmlFor="source_url">출처 링크 (선택)</Label>
        <Input id="source_url" placeholder="https://" {...form.register("source_url")} />
        <FieldError message={form.formState.errors.source_url?.message} />
      </div>

      <div>
        <Label htmlFor="submission_reason">제보 이유 (선택)</Label>
        <Textarea
          id="submission_reason"
          placeholder="이 자료가 배우들에게 왜 도움이 되는지 알려주세요."
          {...form.register("submission_reason")}
        />
        <FieldError message={form.formState.errors.submission_reason?.message} />
      </div>

      {serverError ? <p className="text-sm text-danger-soft">{serverError}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "접수 중…" : "자료 제보하기"}
      </Button>
    </form>
  );
}
