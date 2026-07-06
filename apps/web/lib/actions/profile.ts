"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { profileEditSchema } from "@actone/shared";
import { createClient } from "@/lib/supabase";
import type { ActionState } from "./auth";

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = profileEditSchema.safeParse({
    nickname: formData.get("nickname"),
    actor_status: formData.get("actor_status"),
    activity_field: formData.get("activity_field"),
    region: formData.get("region"),
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  // avatar_url is uploaded client-side to the avatars bucket; only the URL
  // string arrives here. role / member_level / is_suspended are never
  // touched (DB trigger blocks them anyway).
  const avatarUrl = (formData.get("avatar_url") as string) || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname: parsed.data.nickname,
      actor_status: parsed.data.actor_status,
      activity_field: parsed.data.activity_field,
      region: parsed.data.region,
      bio: parsed.data.bio || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 사용 중인 닉네임입니다." };
    }
    return { error: "저장 중 문제가 발생했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/me");
  redirect("/me");
}
