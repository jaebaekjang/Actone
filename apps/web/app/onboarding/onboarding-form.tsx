"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ACTIVITY_FIELD_OPTIONS,
  ACTOR_STATUS_OPTIONS,
  cn,
  EXPECTATION_OPTIONS,
  onboardingSchema,
  type OnboardingInput,
} from "@actone/shared";
import { completeOnboarding } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/input";

export function OnboardingForm() {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();

  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nickname: "",
      region: "",
      expectation: [],
    },
  });

  const expectation = form.watch("expectation") ?? [];

  const toggleExpectation = (value: (typeof EXPECTATION_OPTIONS)[number]) => {
    const next = expectation.includes(value)
      ? expectation.filter((v) => v !== value)
      : [...expectation, value];
    form.setValue("expectation", next, { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit((values) => {
    setServerError(undefined);
    const fd = new FormData();
    fd.set("nickname", values.nickname);
    fd.set("actor_status", values.actor_status);
    fd.set("activity_field", values.activity_field);
    fd.set("region", values.region);
    values.expectation.forEach((e) => fd.append("expectation", e));
    startTransition(async () => {
      const result = await completeOnboarding({}, fd);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          placeholder="커뮤니티에서 사용할 이름 (2~20자)"
          {...form.register("nickname")}
        />
        <FieldError message={form.formState.errors.nickname?.message} />
      </div>

      <div>
        <Label htmlFor="actor_status">현재 상태</Label>
        <Select id="actor_status" defaultValue="" {...form.register("actor_status")}>
          <option value="" disabled>
            선택해주세요
          </option>
          {ACTOR_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <FieldError message={form.formState.errors.actor_status?.message} />
      </div>

      <div>
        <Label htmlFor="activity_field">주요 활동 분야</Label>
        <Select id="activity_field" defaultValue="" {...form.register("activity_field")}>
          <option value="" disabled>
            선택해주세요
          </option>
          {ACTIVITY_FIELD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <FieldError message={form.formState.errors.activity_field?.message} />
      </div>

      <div>
        <Label htmlFor="region">활동 지역</Label>
        <Input id="region" placeholder="예: 서울, 경기, 부산" {...form.register("region")} />
        <FieldError message={form.formState.errors.region?.message} />
      </div>

      <div>
        <Label>액트원에서 기대하는 것 (복수 선택 가능)</Label>
        <div className="flex flex-wrap gap-2">
          {EXPECTATION_OPTIONS.map((option) => {
            const selected = expectation.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleExpectation(option)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selected
                    ? "border-accent bg-accent/15 text-accent-soft"
                    : "bg-surface text-muted hover:text-foreground",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        <FieldError message={form.formState.errors.expectation?.message} />
      </div>

      {serverError ? <p className="text-sm text-danger-soft">{serverError}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "저장 중…" : "액트원 시작하기"}
      </Button>
    </form>
  );
}
