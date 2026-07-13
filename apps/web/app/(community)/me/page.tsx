import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, UserRound } from "lucide-react";
import { cn, type Post } from "@actone/shared";
import { EmptyState } from "@/components/empty-state";
import { MemberLevelBadge } from "@/components/member-level-badge";
import { CommunityPostRow } from "@/components/post-row";
import { buttonStyles } from "@/components/ui/button";
import { attachRelations, getUserAndProfile } from "@/lib/data";

export const metadata: Metadata = { title: "마이페이지" };
export const dynamic = "force-dynamic";

const TABS = [
  { value: "posts", label: "내가 쓴 글" },
  { value: "bookmarks", label: "북마크한 글" },
  { value: "likes", label: "좋아요한 글" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = TABS.some((t) => t.value === rawTab) ? (rawTab as Tab) : "posts";

  const { supabase, user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");

  let posts: Post[] = [];
  if (tab === "posts") {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", user.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(50);
    posts = (data as Post[] | null) ?? [];
  } else {
    const table = tab === "bookmarks" ? "bookmarks" : "post_likes";
    const { data: refs } = await supabase
      .from(table)
      .select("post_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    const ids = ((refs as { post_id: string }[] | null) ?? []).map((r) => r.post_id);
    if (ids.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .in("id", ids)
        .eq("status", "published");
      const byId = new Map(((data as Post[] | null) ?? []).map((p) => [p.id, p]));
      posts = ids.map((id) => byId.get(id)).filter((p): p is Post => !!p);
    }
  }

  const withRelations = await attachRelations(posts);

  return (
    <div className="mx-auto max-w-[860px] space-y-6">
      {/* profile — 커뮤니티 정체성, 포트폴리오 아님 */}
      <div className="border-b pb-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full border bg-surface-soft">
                <UserRound className="h-7 w-7 text-muted" aria-hidden />
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[22px] font-semibold tracking-tight text-foreground">
                  {profile.nickname}
                </p>
                <MemberLevelBadge level={profile.member_level} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {[profile.actor_status, profile.activity_field, profile.region]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <Link href="/me/edit" className={buttonStyles("secondary", "sm")}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            프로필 수정
          </Link>
        </div>
        {profile.bio ? (
          <p className="mt-4 max-w-xl whitespace-pre-wrap text-sm leading-[1.75] text-muted">
            {profile.bio}
          </p>
        ) : null}
      </div>

      {/* tabs */}
      <div className="flex gap-5 border-b">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/me?tab=${t.value}`}
            className={cn(
              "border-b-2 pb-2.5 text-sm transition-colors duration-150",
              tab === t.value
                ? "border-accent font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div>
        {withRelations.length > 0 ? (
          withRelations.map((post) => <CommunityPostRow key={post.id} post={post} />)
        ) : (
          <EmptyState
            title={
              tab === "posts"
                ? "아직 작성한 글이 없습니다"
                : tab === "bookmarks"
                  ? "북마크한 글이 없습니다"
                  : "좋아요한 글이 없습니다"
            }
          />
        )}
      </div>
    </div>
  );
}
