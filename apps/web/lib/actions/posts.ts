"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CATEGORY_SLUGS,
  makeExcerpt,
  parseTags,
  postSchema,
  type Category,
} from "@actone/shared";
import { createClient } from "@/lib/supabase";
import type { ActionState } from "./auth";

function parseMeetupForm(formData: FormData) {
  return {
    region: (formData.get("meetup_region") as string) ?? "",
    meetup_date: (formData.get("meetup_date") as string) ?? "",
    meetup_time: (formData.get("meetup_time") as string) ?? "",
    venue: (formData.get("meetup_venue") as string) ?? "",
    capacity: formData.get("meetup_capacity")
      ? Number(formData.get("meetup_capacity"))
      : null,
    fee: (formData.get("meetup_fee") as string) ?? "",
    application_url: (formData.get("meetup_application_url") as string) ?? "",
    is_regular_member_only: formData.get("meetup_regular_only") === "on",
  };
}

async function requireActiveUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_suspended")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, suspended: profile?.is_suspended === true };
}

export async function createPost(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user, suspended } = await requireActiveUser();
  if (suspended) {
    return { error: "현재 계정 상태에서는 글을 작성할 수 없습니다." };
  }

  const parsed = postSchema.safeParse({
    category_id: formData.get("category_id"),
    title: formData.get("title"),
    content: formData.get("content"),
    tags: parseTags((formData.get("tags") as string) ?? ""),
    meetup: parseMeetupForm(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("id", parsed.data.category_id)
    .maybeSingle();
  if (!category) return { error: "카테고리를 선택해주세요." };

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      category_id: parsed.data.category_id,
      author_id: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: makeExcerpt(parsed.data.content),
      tags: parsed.data.tags,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { error: "글 작성 권한이 없거나 저장에 실패했습니다." };
  }

  if ((category as Category).slug === CATEGORY_SLUGS.offlineMeetups && parsed.data.meetup) {
    const m = parsed.data.meetup;
    await supabase.from("offline_meetup_details").insert({
      post_id: post.id,
      region: m.region || null,
      meetup_date: m.meetup_date || null,
      meetup_time: m.meetup_time || null,
      venue: m.venue || null,
      capacity: m.capacity ?? null,
      fee: m.fee || null,
      application_url: m.application_url,
      is_regular_member_only: m.is_regular_member_only,
    });
  }

  revalidatePath("/community");
  redirect(`/posts/${post.id}`);
}

export async function updatePost(
  postId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user, suspended } = await requireActiveUser();
  if (suspended) {
    return { error: "현재 계정 상태에서는 글을 수정할 수 없습니다." };
  }

  const parsed = postSchema.safeParse({
    category_id: formData.get("category_id"),
    title: formData.get("title"),
    content: formData.get("content"),
    tags: parseTags((formData.get("tags") as string) ?? ""),
    meetup: parseMeetupForm(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "입력값을 확인해주세요." };
  }

  const { data: existing } = await supabase
    .from("posts")
    .select("id, author_id, category_id")
    .eq("id", postId)
    .maybeSingle();
  if (!existing || existing.author_id !== user.id) {
    return { error: "본인이 작성한 글만 수정할 수 있습니다." };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: makeExcerpt(parsed.data.content),
      tags: parsed.data.tags,
    })
    .eq("id", postId);
  if (error) return { error: "수정에 실패했습니다. 다시 시도해주세요." };

  const { data: category } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", existing.category_id)
    .maybeSingle();

  if (category?.slug === CATEGORY_SLUGS.offlineMeetups && parsed.data.meetup) {
    const m = parsed.data.meetup;
    await supabase.from("offline_meetup_details").upsert(
      {
        post_id: postId,
        region: m.region || null,
        meetup_date: m.meetup_date || null,
        meetup_time: m.meetup_time || null,
        venue: m.venue || null,
        capacity: m.capacity ?? null,
        fee: m.fee || null,
        application_url: m.application_url,
        is_regular_member_only: m.is_regular_member_only,
      },
      { onConflict: "post_id" },
    );
  }

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function deletePost(postId: string): Promise<void> {
  const { supabase, user } = await requireActiveUser();

  await supabase
    .from("posts")
    .update({ status: "deleted" })
    .eq("id", postId)
    .eq("author_id", user.id);

  revalidatePath("/community");
  redirect("/community");
}
