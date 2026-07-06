"use server";

import { redirect } from "next/navigation";
import { onboardingSchema } from "@actone/shared";
import { createClient } from "@/lib/supabase";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export interface ActionState {
  error?: string;
}

export async function completeOnboarding(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = onboardingSchema.safeParse({
    nickname: formData.get("nickname"),
    actor_status: formData.get("actor_status"),
    activity_field: formData.get("activity_field"),
    region: formData.get("region"),
    expectation: formData.getAll("expectation"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      nickname: parsed.data.nickname,
      actor_status: parsed.data.actor_status,
      activity_field: parsed.data.activity_field,
      region: parsed.data.region,
      expectation: parsed.data.expectation,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요." };
    }
    return { error: "저장 중 문제가 발생했습니다. 다시 시도해주세요." };
  }

  redirect("/community");
}
