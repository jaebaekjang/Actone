"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CATEGORY_SLUGS,
  MEMBER_LEVELS,
  categoryEditSchema,
  makeExcerpt,
  noticeSchema,
  regularMemberRuleSchema,
  type MemberLevel,
} from "@actone/shared";
import { createClient } from "./supabase";
import { requireAdmin } from "./admin";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export interface ActionState {
  error?: string;
  success?: string;
}

// ---------------------------------------------------------------------------
// members
// ---------------------------------------------------------------------------
export async function setMemberLevel(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const level = formData.get("member_level") as MemberLevel;
  const reason = ((formData.get("reason") as string) ?? "").trim();
  if (!MEMBER_LEVELS.includes(level)) {
    return { error: "올바른 회원 등급이 아닙니다." };
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("member_level")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return { error: "회원을 찾을 수 없습니다." };
  if (target.member_level === level) {
    return { error: "이미 해당 등급입니다." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      member_level: level,
      member_level_updated_at: new Date().toISOString(),
      member_level_updated_by: user.id,
      member_level_note: reason || null,
    })
    .eq("id", userId);
  if (error) return { error: "등급 변경에 실패했습니다." };

  await supabase.from("member_level_logs").insert({
    user_id: userId,
    previous_level: target.member_level,
    new_level: level,
    changed_by: user.id,
    change_type: "manual",
    reason: reason || null,
  });

  revalidatePath(`/members/${userId}`);
  revalidatePath("/members");
  return { success: "회원 등급이 변경되었습니다." };
}

export async function setSuspension(userId: string, suspend: boolean): Promise<void> {
  const { supabase, user } = await requireAdmin();
  if (userId === user.id) return;

  await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId);

  revalidatePath(`/members/${userId}`);
  revalidatePath("/members");
}

// ---------------------------------------------------------------------------
// regular member auto-upgrade rule
// ---------------------------------------------------------------------------
export async function saveRegularMemberRule(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = regularMemberRuleSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    minDaysAfterJoin: formData.get("minDaysAfterJoin"),
    minPostCount: formData.get("minPostCount"),
    minCommentCount: formData.get("minCommentCount"),
    maxReceivedReports: formData.get("maxReceivedReports"),
  });
  if (!parsed.success) {
    return { error: "입력값을 확인해주세요." };
  }

  const { error } = await supabase
    .from("app_settings")
    .upsert(
      { key: "regular_member_rule", value: parsed.data },
      { onConflict: "key" },
    );
  if (error) return { error: "설정 저장에 실패했습니다." };

  revalidatePath("/settings");
  return { success: "설정이 저장되었습니다." };
}

// ---------------------------------------------------------------------------
// posts / comments moderation
// ---------------------------------------------------------------------------
export async function setPostStatus(
  postId: string,
  status: "published" | "hidden" | "deleted",
): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("posts").update({ status }).eq("id", postId);
  revalidatePath("/posts");
  revalidatePath("/notices");
}

export async function setPostPinned(postId: string, pinned: boolean): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("posts").update({ is_pinned: pinned }).eq("id", postId);
  revalidatePath("/posts");
  revalidatePath("/notices");
}

export async function setCommentStatus(
  commentId: string,
  status: "published" | "hidden" | "deleted",
): Promise<void> {
  const { supabase } = await requireAdmin();
  await supabase.from("comments").update({ status }).eq("id", commentId);
  revalidatePath("/comments");
}

// ---------------------------------------------------------------------------
// reports
// ---------------------------------------------------------------------------
export async function resolveReport(
  reportId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const decision = formData.get("decision") as string;
  const adminNote = ((formData.get("admin_note") as string) ?? "").trim();
  const hideTarget = formData.get("hide_target") === "on";

  if (decision !== "resolved" && decision !== "dismissed") {
    return { error: "처리 방식을 선택해주세요." };
  }

  const { data: report } = await supabase
    .from("reports")
    .select("target_type, target_id")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return { error: "신고를 찾을 수 없습니다." };

  const { error } = await supabase
    .from("reports")
    .update({
      status: decision,
      admin_note: adminNote || null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);
  if (error) return { error: "신고 처리에 실패했습니다." };

  if (hideTarget && decision === "resolved") {
    const table = report.target_type === "post" ? "posts" : "comments";
    await supabase.from(table).update({ status: "hidden" }).eq("id", report.target_id);
  }

  revalidatePath("/reports");
  revalidatePath(`/reports/${reportId}`);
  return { success: "신고가 처리되었습니다." };
}

// ---------------------------------------------------------------------------
// resource submissions
// ---------------------------------------------------------------------------
export async function reviewSubmission(
  submissionId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const decision = formData.get("decision") as string;
  const adminNote = ((formData.get("admin_note") as string) ?? "").trim();
  if (decision !== "approved" && decision !== "rejected") {
    return { error: "처리 방식을 선택해주세요." };
  }

  const { data: submission } = await supabase
    .from("resource_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) return { error: "제보를 찾을 수 없습니다." };
  if (submission.status !== "pending") {
    return { error: "이미 처리된 제보입니다." };
  }

  if (decision === "approved") {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", CATEGORY_SLUGS.resources)
      .maybeSingle();
    if (!category) return { error: "자료실 카테고리를 찾을 수 없습니다." };

    const content = submission.source_url
      ? `${submission.content}\n\n출처: ${submission.source_url}`
      : submission.content;

    // author_id = reviewing admin; the user site displays resources-category
    // posts as "액트원 운영진"
    const { error: postError } = await supabase.from("posts").insert({
      category_id: category.id,
      author_id: user.id,
      title: submission.title,
      content,
      excerpt: makeExcerpt(content),
    });
    if (postError) return { error: "자료실 게시글 생성에 실패했습니다." };
  }

  const { error } = await supabase
    .from("resource_submissions")
    .update({
      status: decision,
      admin_note: adminNote || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);
  if (error) return { error: "제보 처리에 실패했습니다." };

  revalidatePath("/submissions");
  revalidatePath(`/submissions/${submissionId}`);
  return {
    success: decision === "approved" ? "승인되어 자료실에 게시되었습니다." : "반려 처리되었습니다.",
  };
}

// ---------------------------------------------------------------------------
// notices
// ---------------------------------------------------------------------------
export async function saveNotice(
  postId: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const parsed = noticeSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    is_pinned: formData.get("is_pinned") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  if (postId) {
    const { error } = await supabase
      .from("posts")
      .update({
        title: parsed.data.title,
        content: parsed.data.content,
        excerpt: makeExcerpt(parsed.data.content),
        is_pinned: parsed.data.is_pinned,
      })
      .eq("id", postId);
    if (error) return { error: "공지 수정에 실패했습니다." };
  } else {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", CATEGORY_SLUGS.notices)
      .maybeSingle();
    if (!category) return { error: "공지사항 카테고리를 찾을 수 없습니다." };

    const { error } = await supabase.from("posts").insert({
      category_id: category.id,
      author_id: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: makeExcerpt(parsed.data.content),
      is_pinned: parsed.data.is_pinned,
    });
    if (error) return { error: "공지 작성에 실패했습니다." };
  }

  revalidatePath("/notices");
  redirect("/notices");
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------
export async function updateCategory(
  categoryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const parsed = categoryEditSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order"),
    is_active: formData.get("is_active") === "on",
  });
  if (!parsed.success) {
    return { error: "입력값을 확인해주세요." };
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .eq("id", categoryId);
  if (error) return { error: "카테고리 수정에 실패했습니다." };

  revalidatePath("/categories");
  return { success: "카테고리가 수정되었습니다." };
}

// ---------------------------------------------------------------------------
// admin access management
// ---------------------------------------------------------------------------
export async function toggleAdminActive(
  adminUserId: string,
  active: boolean,
): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const { data: row } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("id", adminUserId)
    .maybeSingle();
  // never deactivate your own access (lockout guard)
  if (!row || row.user_id === user.id) return;

  await supabase
    .from("admin_users")
    .update({ is_active: active })
    .eq("id", adminUserId);

  revalidatePath("/admins");
}

export async function addAdminByEmail(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();

  const email = ((formData.get("email") as string) ?? "").trim();
  if (!email) return { error: "이메일을 입력해주세요." };

  const { data: target } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("email", email)
    .maybeSingle();
  if (!target) {
    return { error: "해당 이메일로 가입한 회원을 찾을 수 없습니다. 먼저 사용자 사이트에 카카오 로그인해야 합니다." };
  }

  const { error: roleError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", target.id);
  if (roleError) return { error: "권한 변경에 실패했습니다." };

  const { error } = await supabase.from("admin_users").upsert(
    {
      user_id: target.id,
      email: target.email,
      is_active: true,
      created_by: user.id,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "관리자 등록에 실패했습니다." };

  revalidatePath("/admins");
  return { success: "관리자로 등록되었습니다." };
}
