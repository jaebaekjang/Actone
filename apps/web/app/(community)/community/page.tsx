import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, PenLine } from "lucide-react";
import {
  CATEGORY_SLUGS,
  TODAY_QUESTIONS,
  type MeetupPublicDetails,
  type Post,
} from "@actone/shared";
import { CategoryCard } from "@/components/category-card";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { SearchInput } from "@/components/search-input";
import { buttonStyles } from "@/components/ui/button";
import { attachRelations, getActiveCategories } from "@/lib/data";
import { createClient } from "@/lib/supabase";

export const metadata: Metadata = { title: "커뮤니티" };
export const dynamic = "force-dynamic";

export default async function CommunityHomePage() {
  const supabase = await createClient();
  const categories = await getActiveCategories();
  const noticesCategory = categories.find((c) => c.slug === CATEGORY_SLUGS.notices);
  const meetupCategory = categories.find(
    (c) => c.slug === CATEGORY_SLUGS.offlineMeetups,
  );

  const [noticesRes, latestRes, popularRes] = await Promise.all([
    noticesCategory
      ? supabase
          .from("posts")
          .select("*")
          .eq("category_id", noticesCategory.id)
          .eq("status", "published")
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] }),
    supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .neq("category_id", noticesCategory?.id ?? "00000000-0000-0000-0000-000000000000")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("like_count", { ascending: false })
      .order("comment_count", { ascending: false })
      .limit(5),
  ]);

  const notices = (noticesRes.data as Post[] | null) ?? [];
  const [latest, popular] = await Promise.all([
    attachRelations((latestRes.data as Post[] | null) ?? []),
    attachRelations((popularRes.data as Post[] | null) ?? []),
  ]);

  // meetup card extras (safe view only — no application_url)
  const meetupPostIds = latest
    .filter((p) => p.category?.slug === CATEGORY_SLUGS.offlineMeetups)
    .map((p) => p.id);
  let meetupMap = new Map<string, MeetupPublicDetails>();
  if (meetupCategory && meetupPostIds.length > 0) {
    const { data } = await supabase
      .from("offline_meetup_public")
      .select("*")
      .in("post_id", meetupPostIds);
    meetupMap = new Map(
      ((data as MeetupPublicDetails[] | null) ?? []).map((m) => [m.post_id, m]),
    );
  }

  const todayQuestion =
    TODAY_QUESTIONS[
      Math.floor(Date.now() / 86_400_000) % TODAY_QUESTIONS.length
    ];

  return (
    <div className="space-y-8">
      {/* top: search + write */}
      <div className="flex items-center gap-2">
        <SearchInput />
        <Link href="/write" className={buttonStyles("primary", "md", "shrink-0")}>
          <PenLine className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">글쓰기</span>
        </Link>
      </div>

      {/* notices */}
      {notices.length > 0 ? (
        <section className="space-y-2">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/posts/${notice.id}`}
              className="flex items-center gap-2.5 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm hover:bg-accent/10"
            >
              <Megaphone className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span className="truncate text-foreground">{notice.title}</span>
              {notice.is_pinned ? (
                <span className="ml-auto shrink-0 text-xs text-accent">고정</span>
              ) : null}
            </Link>
          ))}
        </section>
      ) : null}

      {/* today's question */}
      <section className="rounded-xl border bg-surface p-5">
        <p className="text-xs font-medium text-accent">오늘의 질문</p>
        <p className="mt-1.5 font-medium leading-relaxed text-foreground">{todayQuestion}</p>
        <Link
          href={`/write?category=${CATEGORY_SLUGS.freeBoard}`}
          className="mt-3 inline-block text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          이 질문에 답해보기 →
        </Link>
      </section>

      {/* categories */}
      <section>
        <h2 className="text-lg font-bold text-foreground">게시판</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* popular */}
      {popular.length > 0 ? (
        <section>
          <h2 className="text-lg font-bold text-foreground">인기 글</h2>
          <div className="mt-3 space-y-3">
            {popular.map((post) => (
              <PostCard key={post.id} post={post} meetup={meetupMap.get(post.id)} />
            ))}
          </div>
        </section>
      ) : null}

      {/* latest */}
      <section>
        <h2 className="text-lg font-bold text-foreground">최신 글</h2>
        <div className="mt-3 space-y-3">
          {latest.length > 0 ? (
            latest.map((post) => (
              <PostCard key={post.id} post={post} meetup={meetupMap.get(post.id)} />
            ))
          ) : (
            <EmptyState
              title="아직 글이 없습니다"
              description="첫 번째 이야기를 남겨보세요."
              action={
                <Link href="/write" className={buttonStyles("primary", "sm")}>
                  글쓰기
                </Link>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}
