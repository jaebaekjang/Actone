import {
  type Category,
  type Post,
} from "@actone/shared";
import { EmptyRow, PageHeader } from "@/components/ui";
import { requirePermission } from "@/lib/admin";
import { PostsTable } from "./posts-table";

export const dynamic = "force-dynamic";

export default async function PostsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { q, category: categorySlug, status } = await searchParams;
  const { supabase } = await requirePermission("community.view");

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  const categories = (categoriesData as Category[] | null) ?? [];
  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  let query = supabase
    .from("posts")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);
  if (selectedCategory) query = query.eq("category_id", selectedCategory.id);
  if (status && ["published", "hidden", "deleted"].includes(status)) {
    query = query.eq("status", status);
  }
  if (q?.trim()) {
    const term = q.trim().replaceAll(",", " ").replaceAll("%", "");
    query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
  }
  const { data } = await query;
  const posts = (data as Post[] | null) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="게시글 관리" description={`${posts.length}건 · 체크박스로 일괄 처리`} />

      <form className="flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="제목 / 내용 검색"
          className="h-10 w-full max-w-xs rounded-lg border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />
        <select
          name="category"
          defaultValue={categorySlug ?? ""}
          className="h-10 rounded-lg border bg-surface px-3 text-sm text-foreground"
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-lg border bg-surface px-3 text-sm text-foreground"
        >
          <option value="">전체 상태</option>
          <option value="published">게시됨</option>
          <option value="hidden">숨김</option>
          <option value="deleted">삭제됨</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
        >
          검색
        </button>
      </form>

      {posts.length > 0 ? (
        <PostsTable
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            is_pinned: p.is_pinned,
            category_id: p.category_id,
            created_at: p.created_at,
          }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
      ) : (
        <EmptyRow message="조건에 맞는 게시글이 없습니다." />
      )}
    </div>
  );
}
