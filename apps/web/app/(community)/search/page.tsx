import type { Metadata } from "next";
import {
  CATEGORY_SLUGS,
  type MeetupPublicDetails,
  type Post,
} from "@actone/shared";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { SearchInput } from "@/components/search-input";
import { attachRelations } from "@/lib/data";
import { createClient } from "@/lib/supabase";

export const metadata: Metadata = { title: "검색" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  let posts: Awaited<ReturnType<typeof attachRelations>> = [];
  let meetupMap = new Map<string, MeetupPublicDetails>();
  if (term) {
    const supabase = await createClient();
    const safe = term.replaceAll(",", " ").replaceAll("%", "");
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .or(`title.ilike.%${safe}%,content.ilike.%${safe}%,tags.cs.{${safe}}`)
      .order("created_at", { ascending: false })
      .limit(50);
    posts = await attachRelations((data as Post[] | null) ?? []);

    const meetupPostIds = posts
      .filter((p) => p.category?.slug === CATEGORY_SLUGS.offlineMeetups)
      .map((p) => p.id);
    if (meetupPostIds.length > 0) {
      const { data: meetups } = await supabase
        .from("offline_meetup_public")
        .select("*")
        .in("post_id", meetupPostIds);
      meetupMap = new Map(
        ((meetups as MeetupPublicDetails[] | null) ?? []).map((m) => [m.post_id, m]),
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-xl font-bold text-foreground">검색</h1>
      <SearchInput defaultValue={term} />

      {term ? (
        <>
          <p className="text-sm text-muted">
            &lsquo;{term}&rsquo; 검색 결과 {posts.length}건
          </p>
          <div className="space-y-3">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} meetup={meetupMap.get(post.id)} />
              ))
            ) : (
              <EmptyState
                title="검색 결과가 없습니다"
                description="제목, 내용, 태그에서 검색합니다. 다른 검색어로 시도해보세요."
              />
            )}
          </div>
        </>
      ) : (
        <EmptyState
          title="검색어를 입력해주세요"
          description="제목, 내용, 태그에서 검색할 수 있습니다."
        />
      )}
    </div>
  );
}
