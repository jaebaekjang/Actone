"use server";

import { redirect } from "next/navigation";
import { resourceSubmissionSchema } from "@actone/shared";
import { createClient } from "@/lib/supabase";
import type { ActionState } from "./auth";

export async function submitResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = resourceSubmissionSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    source_url: formData.get("source_url") ?? "",
    submission_reason: formData.get("submission_reason") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { error } = await supabase.from("resource_submissions").insert({
    submitter_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content,
    source_url: parsed.data.source_url,
    submission_reason: parsed.data.submission_reason || null,
  });
  if (error) {
    return { error: "자료 제보를 접수할 수 없습니다. 계정 상태를 확인해주세요." };
  }

  redirect("/resources/submit?submitted=1");
}
