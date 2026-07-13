import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  formatDateOnly,
  timeAgo,
  type MeetupPublicDetails,
  type PostWithRelations,
} from "@actone/shared";
import { AuthorLabel } from "./member-level-badge";

/** 커뮤니티 홈 상단의 오프라인 모임 하이라이트 모듈. */
export function FeaturedMeetup({
  post,
  meetup,
}: {
  post: PostWithRelations;
  meetup?: MeetupPublicDetails | null;
}) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group block border-l-2 border-accent bg-surface px-5 py-5 transition-colors duration-150 hover:bg-surface-soft"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-accent-soft">오프라인 모임</span>
          {meetup?.is_regular_member_only ? (
            <span className="border px-1.5 py-px text-[11px] text-muted">정회원 전용</span>
          ) : null}
        </div>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent-soft"
          aria-hidden
        />
      </div>
      <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug text-foreground">
        {post.title}
      </h3>
      {meetup && (meetup.region || meetup.meetup_date || meetup.capacity) ? (
        <p className="tnum mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
          {meetup.region ? <span>{meetup.region}</span> : null}
          {meetup.meetup_date ? <span>{formatDateOnly(meetup.meetup_date)}</span> : null}
          {meetup.meetup_time ? <span>{meetup.meetup_time.slice(0, 5)}</span> : null}
          {meetup.capacity ? <span>모집 {meetup.capacity}명</span> : null}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-3">
        <AuthorLabel
          nickname={post.author?.nickname}
          level={post.author?.member_level}
          operator={!post.author_id}
          className="text-xs"
        />
        <span className="tnum text-xs text-muted">{timeAgo(post.created_at)}</span>
      </div>
    </Link>
  );
}
