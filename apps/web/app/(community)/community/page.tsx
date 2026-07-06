import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, PenLine } from "lucide-react";
import {
  CATEGORY_SLUGS,
  TODAY_QUESTIONS,
  cn,
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

const TAB_SLUGS = [
  CATEGORY_SLUGS.auditionInfo,
  CATEGORY_SLUGS.fieldReviews,
  CATEGORY_SLUGS.study,
  CATEGORY_SLUGS.offlineMeetups,
  CATEGORY_SLUGS.actorSurvival,
];

export default async function CommunityHomePage() {
  const supabase = await createClient();
  const categories = await getActiveCategories();
  const noticesCategory = categories.find((c) => c.slug === CATEGORY_SLUGS.notices);
  const meetupCategory = categories.find(
    (c) => c.slug === CATEGORY_SLUGS.offlineMeetups,
  );
  const tabCategories = TAB_SLUGS.map((slug) =>
    categories.find((c) => c.slug === slug),
  ).filter((c): c is NonNullable<typeof c> => !!c);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const noticesId = noticesCategory?.id ?? "00000000-0000-0000-0000-000000000000";

  const [noticesRes, todayRes, latestRes, talkedRes, waitingRes, meetupWeekRes] =
    await Promise.all([
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
        .neq("category_id", noticesId)
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .neq("category_id", noticesId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .neq("category_id", noticesId)
        .gt("comment_count", 0)
        .order("comment_count", { ascending: false })
        .order("like_count", { ascending: false })
        .limit(5),
      supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .neq("category_id", noticesId)
        .eq("comment_count", 0)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("offline_meetup_public")
        .select("*")
        .gte("meetup_date", todayStart.toISOString().slice(0, 10))
        .lt("meetup_date", weekEnd.toISOString().slice(0, 10))
        .order("meetup_date", { ascending: true })
        .limit(3),
    ]);

  const notices = (noticesRes.data as Post[] | null) ?? [];
  const todayPosts = (todayRes.data as Post[] | null) ?? [];
  const hasToday = todayPosts.length > 0;
  const feedRaw = hasToday ? todayPosts : ((latestRes.data as Post[] | null) ?? []);

  const weekMeetups = (meetupWeekRes.data as MeetupPublicDetails[] | null) ?? [];
  const { data: meetupPostsRaw } =
    weekMeetups.length > 0
      ? await supabase
          .from("posts")
          .select("*")
          .in(
            "id",
            weekMeetups.map((m) => m.post_id),
          )
          .eq("status", "published")
      : { data: [] as Post[] };

  const [feed, talked, waiting, meetupPosts] = await Promise.all([
    attachRelations(feedRaw),
    attachRelations((talkedRes.data as Post[] | null) ?? []),
    attachRelations((waitingRes.data as Post[] | null) ?? []),
    attachRelations((meetupPostsRaw as Post[] | null) ?? []),
  ]);

  // meetup card extras across every rendered list (safe view — no application_url)
  const meetupPostIds = Array.from(
    new Set(
      [...feed, ...talked, ...waiting]
        .filter((p) => p.category?.slug === CATEGORY_SLUGS.offlineMeetups)
        .map((p) => p.id),
    ),
  );
  const meetupMap = new Map(weekMeetups.map((m) => [m.post_id, m]));
  const missingMeetupIds = meetupPostIds.filter((id) => !meetupMap.has(id));
  if (meetupCategory && missingMeetupIds.length > 0) {
    const { data } = await supabase
      .from("offline_meetup_public")
      .select("*")
      .in("post_id", missingMeetupIds);
    for (const m of (data as MeetupPublicDetails[] | null) ?? []) {
      meetupMap.set(m.post_id, m);
    }
  }

  const todayQuestion =
    TODAY_QUESTIONS[
      Math.floor(Date.now() / 86_400_000) % TODAY_QUESTIONS.length
    ];

  return (
    <div className="space-y-9">
      {/* waiting room heading */}
      <section>
        <p className="t-label">배우들의 온라인 대기실</p>
        <h1 className="t-display mt-2 text-2xl text-foreground">오늘의 대기실</h1>
        <p className="mt-1.5 text-sm text-muted">
          지금 배우들이 나누고 있는 이야기 — 혼자 삼킨 경험이 누군가에게는
          준비물이 됩니다.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <SearchInput />
          <Link href="/write" className={buttonStyles("primary", "md", "shrink-0")}>
            <PenLine className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">글쓰기</span>
          </Link>
        </div>
      </section>

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

      {/* category tabs */}
      <nav aria-label="게시판 바로가기" className="flex gap-1.5 overflow-x-auto pb-1">
        <span
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-sm",
            "bg-accent/15 font-medium text-accent-soft",
          )}
        >
          전체
        </span>
        {tabCategories.map((category) => (
          <Link
            key={category.id}
            href={`/community/${category.slug}`}
            className="shrink-0 rounded-full border bg-surface px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground"
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {/* today's question */}
      <section className="paper-card rounded-xl p-5">
        <p className="text-sm font-bold text-accent">오늘의 질문</p>
        <p className="mt-1.5 font-medium leading-relaxed text-foreground">{todayQuestion}</p>
        <Link
          href={`/write?category=${CATEGORY_SLUGS.freeBoard}`}
          className="mt-3 inline-block text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          이 질문에 답해보기 →
        </Link>
      </section>

      {/* this week's offline meetups */}
      {meetupPosts.length > 0 ? (
        <section>
          <h2 className="text-lg font-bold text-foreground">이번 주 오프라인 모임</h2>
          <div className="mt-3 space-y-3">
            {meetupPosts.map((post) => (
              <PostCard key={post.id} post={post} meetup={meetupMap.get(post.id)} />
            ))}
          </div>
        </section>
      ) : null}

      {/* today's new posts (falls back to recent) */}
      <section>
        <h2 className="text-lg font-bold text-foreground">
          {hasToday ? `오늘 새 글 ${todayPosts.length}` : "최근 글"}
        </h2>
        {!hasToday ? (
          <p className="mt-1 text-sm text-dim">
            오늘 올라온 글이 아직 없어요. 첫 글의 주인공이 되어보세요.
          </p>
        ) : null}
        <div className="mt-3 space-y-3">
          {feed.length > 0 ? (
            feed.map((post) => (
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

      {/* most talked */}
      {talked.length > 0 ? (
        <section>
          <h2 className="text-lg font-bold text-foreground">댓글 많은 이야기</h2>
          <div className="mt-3 space-y-3">
            {talked.map((post) => (
              <PostCard key={post.id} post={post} meetup={meetupMap.get(post.id)} />
            ))}
          </div>
        </section>
      ) : null}

      {/* waiting for a reply */}
      {waiting.length > 0 ? (
        <section>
          <h2 className="text-lg font-bold text-foreground">답변 기다리는 글</h2>
          <p className="mt-1 text-sm text-dim">
            아직 아무도 답하지 않은 이야기입니다. 첫 댓글이 큰 힘이 됩니다.
          </p>
          <div className="mt-3 space-y-3">
            {waiting.map((post) => (
              <PostCard key={post.id} post={post} meetup={meetupMap.get(post.id)} />
            ))}
          </div>
        </section>
      ) : null}

      {/* all boards */}
      <section>
        <h2 className="text-lg font-bold text-foreground">모든 게시판</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
