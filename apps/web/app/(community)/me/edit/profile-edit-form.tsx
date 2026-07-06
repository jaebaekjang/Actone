"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import {
  ACTIVITY_FIELD_OPTIONS,
  ACTOR_STATUS_OPTIONS,
  profileEditSchema,
  type ProfileEditInput,
} from "@actone/shared";
import { createSupabaseBrowserClient } from "@actone/shared/supabase/client";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfileEditForm({
  userId,
  defaults,
}: {
  userId: string;
  defaults: {
    nickname: string;
    actor_status: string;
    activity_field: string;
    region: string;
    bio: string;
    avatar_url: string;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const [avatarUrl, setAvatarUrl] = useState(defaults.avatar_url);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileEditInput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      nickname: defaults.nickname,
      actor_status: (defaults.actor_status || undefined) as ProfileEditInput["actor_status"],
      activity_field: (defaults.activity_field ||
        undefined) as ProfileEditInput["activity_field"],
      region: defaults.region,
      bio: defaults.bio,
    },
  });

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      toast("jpg, png, webp 형식만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast("이미지는 5MB 이하여야 합니다.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) {
        toast("이미지 업로드에 실패했습니다.");
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    setServerError(undefined);
    const fd = new FormData();
    fd.set("nickname", values.nickname);
    fd.set("actor_status", values.actor_status);
    fd.set("activity_field", values.activity_field);
    fd.set("region", values.region);
    fd.set("bio", values.bio ?? "");
    fd.set("avatar_url", avatarUrl);
    startTransition(async () => {
      const result = await updateProfile({}, fd);
      if (result?.error) setServerError(result.error);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={72}
            height={72}
            className="h-18 w-18 rounded-full border object-cover"
          />
        ) : (
          <span className="flex h-18 w-18 items-center justify-center rounded-full border bg-surface-soft">
            <UserRound className="h-8 w-8 text-muted" aria-hidden />
          </span>
        )}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleAvatarChange(e.target.files?.[0])}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "업로드 중…" : "프로필 사진 변경"}
          </Button>
          <p className="mt-1.5 text-xs text-muted">jpg, png, webp · 5MB 이하</p>
        </div>
      </div>

      <div>
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" {...form.register("nickname")} />
        <FieldError message={form.formState.errors.nickname?.message} />
      </div>

      <div>
        <Label htmlFor="actor_status">현재 상태</Label>
        <Select id="actor_status" {...form.register("actor_status")}>
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
        <Select id="activity_field" {...form.register("activity_field")}>
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
        <Input id="region" {...form.register("region")} />
        <FieldError message={form.formState.errors.region?.message} />
      </div>

      <div>
        <Label htmlFor="bio">소개</Label>
        <Textarea
          id="bio"
          placeholder="어떤 배우인지, 어떤 이야기를 나누고 싶은지 적어주세요 (300자 이하)"
          maxLength={300}
          {...form.register("bio")}
        />
        <FieldError message={form.formState.errors.bio?.message} />
      </div>

      {serverError ? <p className="text-sm text-red-400">{serverError}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending || uploading}>
        {pending ? "저장 중…" : "저장하기"}
      </Button>
    </form>
  );
}
