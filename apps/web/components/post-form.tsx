"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { z } from "zod";
import {
  ALLOWED_IMAGE_TYPES,
  CATEGORY_SLUGS,
  FIELD_REVIEW_WARNING,
  MAX_IMAGE_SIZE_BYTES,
  MAX_POST_IMAGES,
  parseTags,
  type Category,
  type OfflineMeetupDetails,
} from "@actone/shared";
import { createSupabaseBrowserClient } from "@actone/shared/supabase/client";
import type { ActionState } from "@/lib/actions/auth";
import { WarningBox } from "./warning-box";
import { Button } from "./ui/button";
import { FieldError, Input, Label, Select, Textarea } from "./ui/input";
import { toast } from "./ui/toast";

const formSchema = z.object({
  category_id: z.string().uuid("카테고리를 선택해주세요."),
  title: z.string().trim().min(2, "제목은 2자 이상이어야 합니다.").max(100, "제목은 100자 이하여야 합니다."),
  content: z.string().trim().min(10, "내용은 10자 이상이어야 합니다."),
  tags: z
    .string()
    .optional()
    .default("")
    .refine((v) => parseTags(v ?? "").length <= 5, "태그는 최대 5개까지 입력할 수 있습니다."),
  meetup_region: z.string().optional().default(""),
  meetup_date: z.string().optional().default(""),
  meetup_time: z.string().optional().default(""),
  meetup_venue: z.string().optional().default(""),
  meetup_capacity: z.string().optional().default(""),
  meetup_fee: z.string().optional().default(""),
  meetup_application_url: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => !v || /^https?:\/\//.test(v), "신청 링크는 http(s)로 시작해야 합니다."),
  meetup_regular_only: z.boolean().optional().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const AUDITION_HELPER =
  "작품 유형, 역할, 나이대, 촬영 지역, 촬영 일정, 페이 여부, 마감일, 출처 링크, 주의할 점을 함께 적어주시면 다른 배우들에게 큰 도움이 됩니다.";

const STUDY_HELPER =
  "스터디 주제, 진행 방식, 온라인/오프라인 여부, 지역, 요일/시간, 모집 인원, 비용 여부, 신청 방법을 적어주세요.";

export function PostForm({
  categories,
  action,
  mode,
  userId,
  defaultValues,
  meetupDefaults,
  imageDefaults,
}: {
  categories: Pick<Category, "id" | "name" | "slug">[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  userId: string;
  defaultValues?: Partial<Pick<FormValues, "category_id" | "title" | "content" | "tags">>;
  meetupDefaults?: Partial<OfflineMeetupDetails> | null;
  imageDefaults?: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();
  const [images, setImages] = useState<string[]>(imageDefaults ?? []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_POST_IMAGES - images.length;
    if (remaining <= 0) {
      toast(`이미지는 최대 ${MAX_POST_IMAGES}장까지 첨부할 수 있습니다.`);
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const uploaded: string[] = [];
      for (const file of selected) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast("jpg, png, webp 형식만 업로드할 수 있습니다.");
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          toast("이미지는 5MB 이하여야 합니다.");
          continue;
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("post-images").upload(path, file, {
          cacheControl: "3600",
        });
        if (error) {
          toast("이미지 업로드에 실패했습니다.");
          continue;
        }
        uploaded.push(supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl);
      }
      if (uploaded.length > 0) setImages((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: defaultValues?.category_id ?? "",
      title: defaultValues?.title ?? "",
      content: defaultValues?.content ?? "",
      tags: defaultValues?.tags ?? "",
      meetup_region: meetupDefaults?.region ?? "",
      meetup_date: meetupDefaults?.meetup_date ?? "",
      meetup_time: meetupDefaults?.meetup_time?.slice(0, 5) ?? "",
      meetup_venue: meetupDefaults?.venue ?? "",
      meetup_capacity: meetupDefaults?.capacity ? String(meetupDefaults.capacity) : "",
      meetup_fee: meetupDefaults?.fee ?? "",
      meetup_application_url: meetupDefaults?.application_url ?? "",
      meetup_regular_only: meetupDefaults?.is_regular_member_only ?? true,
    },
  });

  const categoryId = form.watch("category_id");
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isMeetup = selectedCategory?.slug === CATEGORY_SLUGS.offlineMeetups;

  const onSubmit = form.handleSubmit((values) => {
    setServerError(undefined);
    const fd = new FormData();
    fd.set("category_id", values.category_id);
    fd.set("title", values.title);
    fd.set("content", values.content);
    fd.set("tags", values.tags ?? "");
    images.slice(0, MAX_POST_IMAGES).forEach((url) => fd.append("image_urls", url));
    if (isMeetup) {
      fd.set("meetup_region", values.meetup_region ?? "");
      fd.set("meetup_date", values.meetup_date ?? "");
      fd.set("meetup_time", values.meetup_time ?? "");
      fd.set("meetup_venue", values.meetup_venue ?? "");
      fd.set("meetup_capacity", values.meetup_capacity ?? "");
      fd.set("meetup_fee", values.meetup_fee ?? "");
      fd.set("meetup_application_url", values.meetup_application_url ?? "");
      if (values.meetup_regular_only) fd.set("meetup_regular_only", "on");
    }
    startTransition(async () => {
      const result = await action({}, fd);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="category_id">카테고리</Label>
        <Select
          id="category_id"
          disabled={mode === "edit"}
          {...form.register("category_id")}
        >
          <option value="" disabled>
            카테고리를 선택해주세요
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <FieldError message={form.formState.errors.category_id?.message} />
      </div>

      {selectedCategory?.slug === CATEGORY_SLUGS.fieldReviews ? (
        <WarningBox>{FIELD_REVIEW_WARNING}</WarningBox>
      ) : null}
      {selectedCategory?.slug === CATEGORY_SLUGS.auditionInfo ? (
        <p className="border-l-2 border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
          {AUDITION_HELPER}
        </p>
      ) : null}
      {selectedCategory?.slug === CATEGORY_SLUGS.study ? (
        <p className="border-l-2 border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
          {STUDY_HELPER}
        </p>
      ) : null}

      <div>
        <Label htmlFor="title">제목</Label>
        <Input id="title" placeholder="제목 (2자 이상)" {...form.register("title")} />
        <FieldError message={form.formState.errors.title?.message} />
      </div>

      <div>
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          className="min-h-56"
          placeholder="내용을 입력해주세요 (10자 이상)"
          {...form.register("content")}
        />
        <FieldError message={form.formState.errors.content?.message} />
      </div>

      <div>
        <Label htmlFor="tags">태그 (쉼표로 구분, 최대 5개)</Label>
        <Input id="tags" placeholder="예: 서울, 네트워킹, 액트원모임" {...form.register("tags")} />
        <FieldError message={form.formState.errors.tags?.message} />
      </div>

      <div>
        <Label>이미지 (선택, 최대 {MAX_POST_IMAGES}장 · jpg/png/webp · 5MB 이하)</Label>
        {images.length > 0 ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white hover:bg-black"
                  aria-label="이미지 삭제"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleImageFiles(e.target.files)}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || images.length >= MAX_POST_IMAGES}
        >
          {uploading ? "업로드 중…" : "이미지 추가"}
        </Button>
      </div>

      {isMeetup ? (
        <section aria-labelledby="meetup-info-heading" className="space-y-4 border-t pt-5">
          <h2 id="meetup-info-heading" className="text-sm font-semibold text-foreground">
            오프라인 모임 정보
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="meetup_region">지역</Label>
              <Input id="meetup_region" placeholder="예: 서울" {...form.register("meetup_region")} />
            </div>
            <div>
              <Label htmlFor="meetup_venue">장소</Label>
              <Input id="meetup_venue" placeholder="예: 홍대입구역 인근 카페" {...form.register("meetup_venue")} />
            </div>
            <div>
              <Label htmlFor="meetup_date">날짜</Label>
              <Input id="meetup_date" type="date" {...form.register("meetup_date")} />
            </div>
            <div>
              <Label htmlFor="meetup_time">시간</Label>
              <Input id="meetup_time" type="time" {...form.register("meetup_time")} />
            </div>
            <div>
              <Label htmlFor="meetup_capacity">모집 인원</Label>
              <Input id="meetup_capacity" type="number" min={1} placeholder="예: 10" {...form.register("meetup_capacity")} />
            </div>
            <div>
              <Label htmlFor="meetup_fee">참가비</Label>
              <Input id="meetup_fee" placeholder="예: 무료 / 1만원" {...form.register("meetup_fee")} />
            </div>
          </div>
          <div>
            <Label htmlFor="meetup_application_url">신청 링크</Label>
            <Input
              id="meetup_application_url"
              placeholder="https:// 로 시작하는 외부 신청 링크"
              {...form.register("meetup_application_url")}
            />
            <FieldError message={form.formState.errors.meetup_application_url?.message} />
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              신청 링크는 정회원, 튜터, 관리자에게만 표시됩니다. 신규회원에게는 노출되지 않습니다.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="accent-accent"
              {...form.register("meetup_regular_only")}
            />
            정회원 전용 모임
          </label>
        </section>
      ) : null}

      {serverError ? <p className="text-sm text-danger-soft">{serverError}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? "저장 중…" : mode === "create" ? "등록하기" : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
