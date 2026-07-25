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
import { ADMIN_ROLE_LABELS } from "@actone/shared";
import { createClient } from "./supabase";
import { logActivity, requireAdmin, requirePermission } from "./admin";

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
  const { supabase, user } = await requirePermission("members.level");

  const level = formData.get("member_level") as MemberLevel;
  const reason = ((formData.get("reason") as string) ?? "").trim();
  if (!MEMBER_LEVELS.includes(level)) {
    return { error: "올바른 회원 등급이 아닙니다." };
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("member_level, nickname")
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

  await logActivity({
    action: "member.level_change",
    targetType: "profile",
    targetId: userId,
    summary: `${target.nickname ?? userId.slice(0, 8)}: ${target.member_level} → ${level}`,
    before: { member_level: target.member_level },
    after: { member_level: level, reason: reason || null },
  });

  revalidatePath(`/members/${userId}`);
  revalidatePath("/members");
  return { success: "회원 등급이 변경되었습니다." };
}

export async function setSuspension(userId: string, suspend: boolean): Promise<void> {
  const { supabase, user } = await requirePermission("members.suspend");
  if (userId === user.id) return;

  const { data: target } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();

  await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId);

  await logActivity({
    action: suspend ? "member.suspend" : "member.unsuspend",
    targetType: "profile",
    targetId: userId,
    summary: `${target?.nickname ?? userId.slice(0, 8)} ${suspend ? "정지" : "정지 해제"}`,
    after: { is_suspended: suspend },
  });

  revalidatePath(`/members/${userId}`);
  revalidatePath("/members");
}

export async function addWarning(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requirePermission("members.suspend");
  const reason = ((formData.get("reason") as string) ?? "").trim();
  if (!reason) return { error: "경고 사유를 입력해주세요." };

  const { data: target } = await supabase
    .from("profiles")
    .select("nickname, warning_count")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return { error: "회원을 찾을 수 없습니다." };

  const next = (target.warning_count ?? 0) + 1;
  const { error } = await supabase
    .from("profiles")
    .update({ warning_count: next })
    .eq("id", userId);
  if (error) return { error: "경고 처리에 실패했습니다." };

  await supabase.from("admin_notes").insert({
    target_type: "profile",
    target_id: userId,
    author_id: user.id,
    body: `[경고 ${next}회] ${reason}`,
  });

  await logActivity({
    action: "member.warn",
    targetType: "profile",
    targetId: userId,
    summary: `${target.nickname ?? userId.slice(0, 8)} 경고 (누적 ${next}회): ${reason}`,
    after: { warning_count: next },
  });

  revalidatePath(`/members/${userId}`);
  return { success: `경고가 부여되었습니다. (누적 ${next}회)` };
}

export async function setTimedSuspension(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requirePermission("members.suspend");
  if (userId === user.id) return { error: "본인 계정은 정지할 수 없습니다." };

  const reason = ((formData.get("reason") as string) ?? "").trim();
  const days = Number(formData.get("days"));
  if (!Number.isFinite(days) || days < 0 || days > 3650) {
    return { error: "정지 기간이 올바르지 않습니다." };
  }

  // days = 0 → 영구 정지 (suspended_until = null)
  const until =
    days > 0 ? new Date(Date.now() + days * 86_400_000).toISOString() : null;

  const { data: target } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return { error: "회원을 찾을 수 없습니다." };

  const { error } = await supabase
    .from("profiles")
    .update({
      is_suspended: true,
      suspended_until: until,
      suspend_reason: reason || null,
    })
    .eq("id", userId);
  if (error) return { error: "정지 처리에 실패했습니다." };

  await logActivity({
    action: "member.suspend",
    targetType: "profile",
    targetId: userId,
    summary: `${target.nickname ?? userId.slice(0, 8)} ${days > 0 ? `${days}일 정지` : "영구 정지"}${reason ? `: ${reason}` : ""}`,
    after: { is_suspended: true, suspended_until: until, suspend_reason: reason || null },
  });

  revalidatePath(`/members/${userId}`);
  revalidatePath("/members");
  return { success: days > 0 ? `${days}일간 정지되었습니다.` : "영구 정지되었습니다." };
}

// ---------------------------------------------------------------------------
// admin notes (operator memos on any entity)
// ---------------------------------------------------------------------------
export async function addAdminNote(
  targetType: string,
  targetId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const body = ((formData.get("body") as string) ?? "").trim();
  if (!body) return { error: "메모 내용을 입력해주세요." };

  const { error } = await supabase.from("admin_notes").insert({
    target_type: targetType,
    target_id: targetId,
    author_id: user.id,
    body,
  });
  if (error) return { error: "메모 저장에 실패했습니다." };

  revalidatePath(`/members/${targetId}`);
  return { success: "메모가 저장되었습니다." };
}

// ---------------------------------------------------------------------------
// regular member auto-upgrade rule
// ---------------------------------------------------------------------------
export async function saveRegularMemberRule(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requirePermission("members.level");

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

  await logActivity({
    action: "settings.update",
    targetType: "app_settings",
    targetId: "regular_member_rule",
    summary: `자동 승급 규칙 ${parsed.data.enabled ? "ON" : "OFF"}`,
    after: parsed.data,
  });

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
  const { supabase } = await requirePermission("community.manage");
  await supabase.from("posts").update({ status }).eq("id", postId);
  await logActivity({
    action: "post.status_change",
    targetType: "post",
    targetId: postId,
    summary: `게시글 상태 → ${status}`,
    after: { status },
  });
  revalidatePath("/posts");
  revalidatePath("/notices");
}

export async function setPostPinned(postId: string, pinned: boolean): Promise<void> {
  const { supabase } = await requirePermission("community.manage");
  await supabase.from("posts").update({ is_pinned: pinned }).eq("id", postId);
  await logActivity({
    action: "post.pin",
    targetType: "post",
    targetId: postId,
    summary: pinned ? "게시글 상단 고정" : "게시글 고정 해제",
    after: { is_pinned: pinned },
  });
  revalidatePath("/posts");
  revalidatePath("/notices");
}

export async function setCommentStatus(
  commentId: string,
  status: "published" | "hidden" | "deleted",
): Promise<void> {
  const { supabase } = await requirePermission("community.manage");
  await supabase.from("comments").update({ status }).eq("id", commentId);
  await logActivity({
    action: "comment.status_change",
    targetType: "comment",
    targetId: commentId,
    summary: `댓글 상태 → ${status}`,
    after: { status },
  });
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
  const { supabase } = await requirePermission("reports.manage");

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

  await logActivity({
    action: "report.resolve",
    targetType: "report",
    targetId: reportId,
    summary: `신고 ${decision === "resolved" ? "해결" : "기각"}${hideTarget && decision === "resolved" ? " · 대상 숨김" : ""}`,
    after: { status: decision, hideTarget },
  });

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
  const { supabase, user } = await requirePermission("resource.manage");

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

  await logActivity({
    action: "submission.review",
    targetType: "resource_submission",
    targetId: submissionId,
    summary: `${submission.title}: ${decision === "approved" ? "승인" : "반려"}`,
    after: { status: decision },
  });

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
  const { supabase, user } = await requirePermission("community.manage");

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

  await logActivity({
    action: "notice.save",
    targetType: "post",
    targetId: postId,
    summary: `${postId ? "공지 수정" : "공지 작성"}: ${parsed.data.title}`,
  });

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
  const { supabase } = await requirePermission("community.manage");

  const parsed = categoryEditSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order"),
    is_active: formData.get("is_active") === "on",
    icon: formData.get("icon") ?? "",
    intro: formData.get("intro") ?? "",
    read_level: formData.get("read_level"),
    write_level: formData.get("write_level"),
    comment_level: formData.get("comment_level"),
    requires_approval: formData.get("requires_approval") === "on",
    is_anonymous: formData.get("is_anonymous") === "on",
    max_images: formData.get("max_images"),
    allow_tags: formData.get("allow_tags") === "on",
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
      icon: parsed.data.icon || null,
      intro: parsed.data.intro || null,
      read_level: parsed.data.read_level,
      write_level: parsed.data.write_level,
      comment_level: parsed.data.comment_level,
      requires_approval: parsed.data.requires_approval,
      is_anonymous: parsed.data.is_anonymous,
      max_images: parsed.data.max_images,
      allow_tags: parsed.data.allow_tags,
    })
    .eq("id", categoryId);
  if (error) return { error: "카테고리 수정에 실패했습니다." };

  await logActivity({
    action: "category.update",
    targetType: "category",
    targetId: categoryId,
    summary: `게시판 수정: ${parsed.data.name}`,
    after: parsed.data,
  });

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
  const { supabase, user } = await requirePermission("system.admins");

  const { data: row } = await supabase
    .from("admin_users")
    .select("user_id, email")
    .eq("id", adminUserId)
    .maybeSingle();
  // never deactivate your own access (lockout guard)
  if (!row || row.user_id === user.id) return;

  await supabase
    .from("admin_users")
    .update({ is_active: active })
    .eq("id", adminUserId);

  await logActivity({
    action: "admin.toggle_active",
    targetType: "admin_user",
    targetId: adminUserId,
    summary: `${row.email ?? adminUserId.slice(0, 8)} ${active ? "활성화" : "비활성화"}`,
    after: { is_active: active },
  });

  revalidatePath("/admins");
}

export async function addAdminByEmail(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requirePermission("system.admins");

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

  await logActivity({
    action: "admin.add",
    targetType: "admin_user",
    targetId: target.id,
    summary: `관리자 등록: ${email}`,
  });

  revalidatePath("/admins");
  return { success: "관리자로 등록되었습니다." };
}

// ---------------------------------------------------------------------------
// admin roles (RBAC)
// ---------------------------------------------------------------------------
export async function setAdminRole(
  adminUserId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requirePermission("system.roles");

  const roleKey = ((formData.get("role_key") as string) ?? "").trim();
  if (!ADMIN_ROLE_LABELS[roleKey]) {
    return { error: "올바른 역할이 아닙니다." };
  }

  const { data: row } = await supabase
    .from("admin_users")
    .select("user_id, email, role_key")
    .eq("id", adminUserId)
    .maybeSingle();
  if (!row) return { error: "관리자를 찾을 수 없습니다." };
  // guard against self-lockout: can't drop your own super_admin role
  if (row.user_id === user.id && row.role_key === "super_admin" && roleKey !== "super_admin") {
    return { error: "본인의 최고관리자 역할은 변경할 수 없습니다." };
  }
  if (row.role_key === roleKey) {
    return { error: "이미 해당 역할입니다." };
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ role_key: roleKey })
    .eq("id", adminUserId);
  if (error) return { error: "역할 변경에 실패했습니다." };

  await logActivity({
    action: "admin.role_change",
    targetType: "admin_user",
    targetId: adminUserId,
    summary: `${row.email ?? adminUserId.slice(0, 8)}: ${ADMIN_ROLE_LABELS[row.role_key] ?? row.role_key} → ${ADMIN_ROLE_LABELS[roleKey]}`,
    before: { role_key: row.role_key },
    after: { role_key: roleKey },
  });

  revalidatePath("/system/roles");
  revalidatePath("/admins");
  return { success: "역할이 변경되었습니다." };
}
