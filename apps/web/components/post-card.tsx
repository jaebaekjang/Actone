import Link from "next/link";
import { Bookmark, Eye, Heart, MessageCircle, Pin } from "lucide-react";
import {
  ADMIN_ONLY_CATEGORY_SLUGS,
  CATEGORY_SLUGS,
  makeExcerpt,
  timeAgo,
  type MeetupPublicDetails,
  type PostWithRelations,
} from "@actone/shared";
import { AuthorLabel } from "./member-level-badge";

export function PostCard({
  post,
  meetup,
  showCategory = true,
}: {
  post: PostWithRelations;
  meetup?: MeetupPublicDetails | null;
  showCategory?: boolean;
}) {
  const operatorPost =
    !post.author_id ||
    (post.category ? ADMIN_ONLY_CATEGORY_SLUGS.includes(post.category.slug) : false);
  const isMeetup = post.category?.slug === CATEGORY_SLUGS.offlineMeetups;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-xl border bg-surface p-4 transition-colors hover:border-accent/40"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        {post.is_pinned ? (
          <span className="inline-flex items-center gap-1 text-accent">
            <Pin className="h-3 w-3" aria-hidden /> 고정
          </span>
        ) : null}
        {showCategory && post.category ? (
          <span className="rounded-full bg-surface-soft px-2 py-0.5">{post.category.name}</span>
        ) : null}
        {isMeetup ? (
          <>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent-soft">
              오프라인
            </span>
            {meetup?.is_regular_member_only ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent-soft">
                정회원 전용
              </span>
            ) : null}
          </>
        ) : null}
      </div>

      <h3 className="mt-2 line-clamp-2 font-semibold leading-snug text-foreground">
        {post.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
        {post.excerpt ?? makeExcerpt(post.content)}
      </p>

      {isMeetup && meetup ? (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {meetup.region ? <span>지역 {meetup.region}</span> : null}
          {meetup.meetup_date ? <span>날짜 {meetup.meetup_date}</span> : null}
          {meetup.meetup_time ? <span>시간 {meetup.meetup_time.slice(0, 5)}</span> : null}
          {meetup.capacity ? <span>모집 {meetup.capacity}명</span> : null}
        </div>
      ) : null}

      {post.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-accent-soft">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2">
        <AuthorLabel
          nickname={post.author?.nickname}
          level={post.author?.member_level}
          operator={operatorPost}
          className="text-xs"
        />
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" aria-hidden /> {post.like_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden /> {post.comment_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bookmark className="h-3.5 w-3.5" aria-hidden /> {post.bookmark_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" aria-hidden /> {post.view_count}
          </span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
