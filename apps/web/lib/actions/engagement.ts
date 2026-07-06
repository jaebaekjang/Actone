"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { commentSchema, reportSchema, REPORT_SUBMITTED_MESSAGE } from "@actone/shared";
import { createClient } from "@/lib/supabase";
import type { ActionState } from "./auth";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createComment(
  postId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "댓글 내용을 확인해주세요." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content: parsed.data.content,
  });
  if (error) {
    return { error: "댓글을 작성할 수 없습니다. 계정 상태를 확인해주세요." };
  }

  revalidatePath(`/posts/${postId}`);
  return {};
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  await supabase
    .from("comments")
    .update({ status: "deleted" })
    .eq("id", commentId)
    .eq("author_id", user.id);
  revalidatePath(`/posts/${postId}`);
}

export async function toggleLike(postId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  }
  revalidatePath(`/posts/${postId}`);
}

export async function toggleBookmark(postId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
  } else {
    await supabase.from("bookmarks").insert({ post_id: postId, user_id: user.id });
  }
  revalidatePath(`/posts/${postId}`);
}

export interface ReportState {
  error?: string;
  message?: string;
}

export async function createReport(
  input: unknown,
): Promise<ReportState> {
  const { supabase, user } = await requireUser();

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "신고 내용을 확인해주세요." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: parsed.data.target_type,
    target_id: parsed.data.target_id,
    reason: parsed.data.reason,
    detail: parsed.data.detail || null,
  });
  if (error) {
    return { error: "신고를 접수할 수 없습니다. 계정 상태를 확인해주세요." };
  }
  return { message: REPORT_SUBMITTED_MESSAGE };
}
