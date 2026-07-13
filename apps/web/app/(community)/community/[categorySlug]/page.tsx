import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine } from "lucide-react";
import {
  CATEGORY_SLUGS,
  FIELD_REVIEW_WARNING,
  SORT_OPTIONS,
  cn,
  type MeetupPublicDetails,
  type Post,
  type SortValue,
} from "@actone/shared";
import { EmptyState } from "@/components/empty-state";
import { CommunityPostRow } from "@/components/post-row";
import { SearchInput } from "@/components/search-input";
import { WarningBox } from "@/components/warning-box";
import { buttonStyles } from "@/components/ui/button";
import { attachRelations, getActiveCategories } from "@/lib/data";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const SORT_COLUMNS: Record<SortValue, { column: string; ascending: boolean }> = {
  latest: { column: "created_at", ascending: false },
  popular: { column: "like_count", ascending: false },
  comments: { column: "comment_count", ascending: false },
  bookmarks: { column: "bookmark_count", ascending: false },
};

export default async function CategoryBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ sort?: string; q?: string; page?: string }>;
}) {
  const { categorySlug } = await params;
  const { sort: rawSort, q, page: rawPage } = await searchParams;

  const categories = await getActiveCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const sort: SortValue = SORT_OPTIONS.some((s) => s.value === rawSort)
    ? (rawSort as SortValue)
    : "latest";
  const page = Math.max(1, Number(rawPage) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .eq("category_id", category.id)
    .eq("status", "published");

  if (q?.trim()) {
    const term = q.trim().replaceAll(",", " ").replaceAll("%", "");
    query = query.or(
      `title.ilike.%${term}%,content.ilike.%${term}%,tags.cs.{${term}}`,
    );
  }

  const order = SORT_COLUMNS[sort];
  const { data, count } = await query
    .order("is_pinned", { ascending: false })
    .order(order.column, { ascending: order.ascending })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const posts = await attachRelations((data as Post[] | null) ?? []);

  let meetupMap = new Map<string, MeetupPublicDetails>();
  if (category.slug === CATEGORY_SLUGS.offlineMeetups && posts.length > 0) {
    const { data: meetups } = await supabase
      .from("offline_meetup_public")
      .select("*")
      .in(
        "post_id",
        posts.map((p) => p.id),
      );
    meetupMap = new Map(
      ((meetups as MeetupPublicDetails[] | null) ?? []).map((m) => [m.post_id, m]),
    );
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { sort, q, page, ...overrides };
    if (merged.sort && merged.sort !== "latest") sp.set("sort", String(merged.sort));
    if (merged.q) sp.set("q", String(merged.q));
    if (merged.page && Number(merged.page) > 1) sp.set("page", String(merged.page));
    const str = sp.toString();
    return str ? `?${str}` : "";
  };

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      <div className="border-b pb-5">
        <h1 className="text-[24px] font-semibold tracking-tight text-foreground md:text-[28px]">
          {category.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-[1.75] text-muted">
          {category.description}
        </p>
      </div>

      {category.slug === CATEGORY_SLUGS.fieldReviews ? (
        <WarningBox>{FIELD_REVIEW_WARNING}</WarningBox>
      ) : null}

      <div className="flex items-center gap-2">
        <SearchInput
          action={`/community/${category.slug}`}
          defaultValue={q ?? ""}
          placeholder={`${category.name} 안에서 검색`}
        />
        <Link
          href={`/write?category=${category.slug}`}
          className={buttonStyles("primary", "md", "shrink-0")}
        >
          <PenLine className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">글쓰기</span>
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto border-b">
        {SORT_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={`/community/${category.slug}${buildQuery({ sort: option.value, page: 1 })}`}
            className={cn(
              "shrink-0 border-b-2 pb-2.5 text-sm transition-colors duration-150",
              sort === option.value
                ? "border-accent font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <div>
        {posts.length > 0 ? (
          posts.map((post) => (
            <CommunityPostRow
              key={post.id}
              post={post}
              meetup={meetupMap.get(post.id)}
              showCategory={false}
            />
          ))
        ) : (
          <EmptyState
            title={q ? "검색 결과가 없습니다" : "아직 글이 없습니다"}
            description={q ? "다른 검색어로 시도해보세요." : "첫 번째 글을 남겨보세요."}
          />
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 pt-2 text-sm">
          {page > 1 ? (
            <Link
              href={`/community/${category.slug}${buildQuery({ page: page - 1 })}`}
              className={buttonStyles("secondary", "sm")}
            >
              이전
            </Link>
          ) : null}
          <span className="px-2 text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/community/${category.slug}${buildQuery({ page: page + 1 })}`}
              className={buttonStyles("secondary", "sm")}
            >
              다음
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
