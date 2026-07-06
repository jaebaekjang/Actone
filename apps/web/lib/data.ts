import { cache } from "react";
import type {
  Category,
  Comment,
  Post,
  PostWithRelations,
  Profile,
  PublicProfile,
} from "@actone/shared";
import { createClient } from "./supabase";

export const getUserAndProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile: (profile as Profile | null) ?? null };
});

export const getActiveCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Category[] | null) ?? [];
});

/** attach author (public_profiles) + category info to posts */
export async function attachRelations(posts: Post[]): Promise<PostWithRelations[]> {
  if (posts.length === 0) return [];
  const supabase = await createClient();

  const authorIds = Array.from(
    new Set(posts.map((p) => p.author_id).filter((v): v is string => !!v)),
  );
  const categoryIds = Array.from(new Set(posts.map((p) => p.category_id)));

  const [authorsRes, categoriesRes] = await Promise.all([
    authorIds.length
      ? supabase.from("public_profiles").select("*").in("id", authorIds)
      : Promise.resolve({ data: [] as PublicProfile[] }),
    supabase.from("categories").select("id, name, slug").in("id", categoryIds),
  ]);

  const authors = new Map(
    ((authorsRes.data as PublicProfile[] | null) ?? []).map((a) => [a.id, a]),
  );
  const categories = new Map(
    (
      (categoriesRes.data as Pick<Category, "id" | "name" | "slug">[] | null) ?? []
    ).map((c) => [c.id, c]),
  );

  return posts.map((p) => ({
    ...p,
    author: p.author_id ? (authors.get(p.author_id) ?? null) : null,
    category: categories.get(p.category_id) ?? null,
  }));
}

export async function attachCommentAuthors(comments: Comment[]): Promise<Comment[]> {
  if (comments.length === 0) return [];
  const supabase = await createClient();
  const authorIds = Array.from(
    new Set(comments.map((c) => c.author_id).filter((v): v is string => !!v)),
  );
  if (authorIds.length === 0) return comments;

  const { data } = await supabase
    .from("public_profiles")
    .select("*")
    .in("id", authorIds);
  const authors = new Map(
    ((data as PublicProfile[] | null) ?? []).map((a) => [a.id, a]),
  );
  return comments.map((c) => ({
    ...c,
    author: c.author_id ? (authors.get(c.author_id) ?? null) : null,
  }));
}
