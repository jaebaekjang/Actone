import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, PenLine } from "lucide-react";
import {
  CATEGORY_SLUGS,
  TODAY_QUESTIONS,
  type MeetupPublicDetails,
  type Post,
} from "@actone/shared";
import { CategoryScroller } from "@/components/category-index";
import { CommunitySidebar } from "@/components/community-sidebar";
import { EmptyState } from "@/components/empty-state";
import { FeaturedMeetup } from "@/components/featured-meetup";
import { CommunityPostRow } from "@/components/post-row";
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

  const [noticesRes, latestRes, popularRes, featuredRes] = await Promise.all([
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
    meetupCategory
      ? supabase
          .from("posts")
          .select("*")
          .eq("category_id", meetupCategory.id)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] }),
  ]);

  const notices = (noticesRes.data as Post[] | null) ?? [];
  const featuredRaw = ((featuredRes.data as Post[] | null) ?? [])[0] ?? null;
  const [latestAll, popular, featuredList] = await Promise.all([
    attachRelations((latestRes.data as Post[] | null) ?? []),
    attachRelations((popularRes.data as Post[] | null) ?? []),
    attachRelations(featuredRaw ? [featuredRaw] : []),
  ]);
  const featured = featuredList[0] ?? null;
  const latest = featured ? latestAll.filter((p) => p.id !== featured.id) : latestAll;

  // meetup card extras (safe view only — no application_url)
  const meetupPostIds = [
    ...latest
      .filter((p) => p.category?.slug === CATEGORY_SLUGS.offlineMeetups)
      .map((p) => p.id),
    ...(featured ? [featured.id] : []),
  ];
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
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
      {/* main feed */}
      <div className="space-y-8">
        {/* mobile: search + write */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchInput />
          <Link href="/write" className={buttonStyles("primary", "md", "shrink-0")}>
            <PenLine className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">글쓰기</span>
          </Link>
        </div>

        {/* mobile: category scroller */}
        <CategoryScroller categories={categories} />

        {/* notices — 홈 상단에만 */}
        {notices.length > 0 ? (
          <section className="border-y">
            {notices.map((notice, i) => (
              <Link
                key={notice.id}
                href={`/posts/${notice.id}`}
                className={
                  "flex items-center gap-2.5 px-1 py-3 text-sm transition-colors duration-150 hover:bg-surface" +
                  (i > 0 ? " border-t" : "")
                }
              >
                <Megaphone className="h-3.5 w-3.5 shrink-0 text-accent-soft" aria-hidden />
                <span className="shrink-0 text-xs font-medium text-accent-soft">공지</span>
                <span className="truncate text-foreground">{notice.title}</span>
                {notice.is_pinned ? (
                  <span className="ml-auto shrink-0 text-xs text-muted">고정</span>
                ) : null}
              </Link>
            ))}
          </section>
        ) : null}

        {/* featured offline meetup */}
        {featured ? (
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[19px] font-semibold tracking-tight text-foreground">
                오프라인 모임
              </h2>
              <Link
                href={`/community/${CATEGORY_SLUGS.offlineMeetups}`}
                className="text-sm text-muted transition-colors hover:text-accent-soft"
              >
                전체 보기
              </Link>
            </div>
            <div className="mt-3">
              <FeaturedMeetup post={featured} meetup={meetupMap.get(featured.id)} />
            </div>
          </section>
        ) : null}

        {/* today's question — mobile (desktop은 우측 레일) */}
        <section className="border-l-2 border-line pl-4 lg:hidden">
          <p className="text-xs font-medium text-accent-soft">오늘의 질문</p>
          <p className="mt-1.5 font-medium leading-[1.7] text-foreground">{todayQuestion}</p>
          <Link
            href={`/write?category=${CATEGORY_SLUGS.freeBoard}`}
            className="mt-2 inline-block text-sm text-muted underline decoration-line underline-offset-4 hover:text-accent-soft"
          >
            이 질문에 답해보기
          </Link>
        </section>

        {/* latest */}
        <section>
          <h2 className="text-[19px] font-semibold tracking-tight text-foreground">
            최신 글
          </h2>
          <div className="mt-3 border-t">
            {latest.length > 0 ? (
              latest.map((post) => (
                <CommunityPostRow
                  key={post.id}
                  post={post}
                  meetup={meetupMap.get(post.id)}
                />
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

        {/* popular — mobile (desktop은 우측 레일) */}
        {popular.length > 0 ? (
          <section className="lg:hidden">
            <h2 className="text-[19px] font-semibold tracking-tight text-foreground">
              인기 글
            </h2>
            <div className="mt-3 border-t">
              {popular.map((post) => (
                <CommunityPostRow
                  key={post.id}
                  post={post}
                  meetup={meetupMap.get(post.id)}
                  showExcerpt={false}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* desktop right rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-10">
          <Link href="/write" className={buttonStyles("primary", "md", "w-full")}>
            <PenLine className="h-4 w-4" aria-hidden />
            글쓰기
          </Link>
          <CommunitySidebar
            categories={categories}
            popular={popular}
            todayQuestion={todayQuestion}
          />
        </div>
      </aside>
    </div>
  );
}
