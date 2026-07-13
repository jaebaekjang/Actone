import Link from "next/link";
import { Pin } from "lucide-react";
import {
  ADMIN_ONLY_CATEGORY_SLUGS,
  CATEGORY_SLUGS,
  formatDateOnly,
  makeExcerpt,
  timeAgo,
  type MeetupPublicDetails,
  type PostWithRelations,
} from "@actone/shared";
import { AuthorLabel } from "./member-level-badge";

/**
 * 게시판의 기본 단위. 카드가 아니라 훑어 내리기 좋은 행 —
 * 목록 컨테이너는 `border-t`만 주고, 행이 아래 괘선을 가진다.
 */
export function CommunityPostRow({
  post,
  meetup,
  showCategory = true,
  showExcerpt = true,
}: {
  post: PostWithRelations;
  meetup?: MeetupPublicDetails | null;
  showCategory?: boolean;
  showExcerpt?: boolean;
}) {
  const operatorPost =
    !post.author_id ||
    (post.category ? ADMIN_ONLY_CATEGORY_SLUGS.includes(post.category.slug) : false);
  const isMeetup = post.category?.slug === CATEGORY_SLUGS.offlineMeetups;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="-mx-2 block border-b px-2 py-4 transition-colors duration-150 hover:bg-surface"
    >
      {(post.is_pinned || (showCategory && post.category) || isMeetup) && (
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
          {post.is_pinned ? (
            <span className="inline-flex items-center gap-1 font-medium text-accent-soft">
              <Pin className="h-3 w-3" aria-hidden /> 고정
            </span>
          ) : null}
          {showCategory && post.category ? (
            <span className="font-medium text-accent-soft">{post.category.name}</span>
          ) : null}
          {isMeetup ? (
            <>
              <span className="border border-accent/50 px-1.5 py-px text-[11px] font-medium text-accent-soft">
                오프라인
              </span>
              {meetup?.is_regular_member_only ? (
                <span className="border px-1.5 py-px text-[11px] text-muted">
                  정회원 전용
                </span>
              ) : null}
            </>
          ) : null}
        </div>
      )}

      <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug text-foreground">
        {post.title}
      </h3>
      {showExcerpt ? (
        <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted">
          {post.excerpt ?? makeExcerpt(post.content)}
        </p>
      ) : null}

      {isMeetup && meetup ? (
        <p className="tnum mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {meetup.region ? <span>{meetup.region}</span> : null}
          {meetup.meetup_date ? <span>{formatDateOnly(meetup.meetup_date)}</span> : null}
          {meetup.meetup_time ? <span>{meetup.meetup_time.slice(0, 5)}</span> : null}
          {meetup.capacity ? <span>모집 {meetup.capacity}명</span> : null}
        </p>
      ) : null}

      <div className="mt-2 flex items-center justify-between gap-3">
        <AuthorLabel
          nickname={post.author?.nickname}
          level={post.author?.member_level}
          operator={operatorPost}
          className="min-w-0 text-xs"
        />
        <p className="tnum flex shrink-0 items-center gap-2.5 text-xs text-muted">
          <span>댓글 {post.comment_count}</span>
          <span>좋아요 {post.like_count}</span>
          <span aria-hidden className="text-muted/50">·</span>
          <span>{timeAgo(post.created_at)}</span>
        </p>
      </div>
    </Link>
  );
}
