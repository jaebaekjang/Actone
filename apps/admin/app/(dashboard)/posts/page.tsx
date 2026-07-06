import Link from "next/link";
import {
  formatDateTime,
  POST_STATUS_LABELS,
  siteConfig,
  type Category,
  type Post,
} from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyRow, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { setPostPinned, setPostStatus } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PostsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { q, category: categorySlug, status } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  const categories = (categoriesData as Category[] | null) ?? [];
  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  let query = supabase
    .from("posts")
    .select("*")
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
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-5">
      <PageHeader title="게시글 관리" />

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

      <div className="space-y-2">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{categoryById.get(post.category_id)?.name ?? "-"}</span>
                  <StatusBadge
                    label={POST_STATUS_LABELS[post.status] ?? post.status}
                    tone={
                      post.status === "published"
                        ? "positive"
                        : post.status === "hidden"
                          ? "warning"
                          : "negative"
                    }
                  />
                  {post.is_pinned ? <StatusBadge label="고정" tone="warning" /> : null}
                  <span>{formatDateTime(post.created_at)}</span>
                </div>
                <a
                  href={`${siteConfig.url}/posts/${post.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-1 block truncate text-sm font-medium text-foreground hover:text-accent-soft"
                >
                  {post.title}
                </a>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                {post.status !== "published" ? (
                  <ConfirmButton action={setPostStatus.bind(null, post.id, "published")} tone="positive">
                    복구
                  </ConfirmButton>
                ) : null}
                {post.status !== "hidden" ? (
                  <ConfirmButton action={setPostStatus.bind(null, post.id, "hidden")}>
                    숨김
                  </ConfirmButton>
                ) : null}
                {post.status !== "deleted" ? (
                  <ConfirmButton
                    action={setPostStatus.bind(null, post.id, "deleted")}
                    tone="danger"
                    confirmMessage="이 글을 삭제 처리할까요?"
                  >
                    삭제
                  </ConfirmButton>
                ) : null}
                <ConfirmButton action={setPostPinned.bind(null, post.id, !post.is_pinned)}>
                  {post.is_pinned ? "고정 해제" : "고정"}
                </ConfirmButton>
                <Link
                  href={`/posts/${post.id}`}
                  className="inline-flex h-8 items-center rounded-lg border bg-surface-soft px-3 text-xs text-foreground hover:bg-surface-soft/70"
                >
                  내용
                </Link>
              </div>
            </div>
          ))
        ) : (
          <EmptyRow message="조건에 맞는 게시글이 없습니다." />
        )}
      </div>
    </div>
  );
}
