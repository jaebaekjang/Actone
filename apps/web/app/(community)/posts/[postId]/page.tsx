import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ExternalLink, MapPin, Pencil, Users, Wallet } from "lucide-react";
import {
  ADMIN_ONLY_CATEGORY_SLUGS,
  CATEGORY_SLUGS,
  MEETUP_LINK_RESTRICTED_MESSAGE,
  MEETUP_LINK_SUSPENDED_MESSAGE,
  formatDateTime,
  type Comment,
  type MeetupPublicDetails,
  type Post,
  type PostImage,
} from "@actone/shared";
import { CommentForm } from "@/components/comment-form";
import { DeleteCommentButton, DeletePostButton } from "@/components/delete-buttons";
import { AuthorLabel } from "@/components/member-level-badge";
import { PostActions } from "@/components/post-actions";
import { ReportDialog } from "@/components/report-dialog";
import { attachCommentAuthors, attachRelations, getUserAndProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const { supabase, user, profile } = await getUserAndProfile();

  const { data: rawPost } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  const post = rawPost as Post | null;
  if (!post || post.status === "deleted") notFound();

  const [withRelations] = await attachRelations([post]);
  const isAuthor = !!user && post.author_id === user.id;
  const operatorPost =
    !post.author_id ||
    (withRelations.category
      ? ADMIN_ONLY_CATEGORY_SLUGS.includes(withRelations.category.slug)
      : false);

  // count the view (server-side RPC; clients cannot update counters directly)
  await supabase.rpc("increment_view_count", { p_post_id: postId });

  // meetup details (safe view) + application URL (entitlement-checked RPC)
  let meetup: MeetupPublicDetails | null = null;
  let applicationUrl: string | null = null;
  if (withRelations.category?.slug === CATEGORY_SLUGS.offlineMeetups) {
    const { data: meetupData } = await supabase
      .from("offline_meetup_public")
      .select("*")
      .eq("post_id", postId)
      .maybeSingle();
    meetup = (meetupData as MeetupPublicDetails | null) ?? null;

    if (meetup?.has_application_url) {
      const { data: url } = await supabase.rpc("get_meetup_application_url", {
        p_post_id: postId,
      });
      applicationUrl = (url as string | null) ?? null;
    }
  }

  const [commentsRes, imagesRes, likeRes, bookmarkRes] = await Promise.all([
    supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("status", "published")
      .order("created_at", { ascending: true }),
    supabase
      .from("post_images")
      .select("*")
      .eq("post_id", postId)
      .order("sort_order", { ascending: true }),
    user
      ? supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("bookmarks")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const comments = await attachCommentAuthors((commentsRes.data as Comment[] | null) ?? []);
  const images = (imagesRes.data as PostImage[] | null) ?? [];

  return (
    <article className="mx-auto max-w-3xl">
      {post.status === "hidden" ? (
        <p className="mb-4 rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
          이 글은 관리자에 의해 숨김 처리되어 다른 회원에게 보이지 않습니다.
        </p>
      ) : null}

      {/* header */}
      <div className="border-b pb-5">
        {withRelations.category ? (
          <Link
            href={`/community/${withRelations.category.slug}`}
            className="text-sm text-accent-soft hover:underline"
          >
            {withRelations.category.name}
          </Link>
        ) : null}
        <h1 className="mt-2 text-xl font-bold leading-snug text-foreground md:text-2xl">
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <AuthorLabel
              nickname={withRelations.author?.nickname}
              level={withRelations.author?.member_level}
              operator={operatorPost}
            />
            <span className="text-xs text-muted">{formatDateTime(post.created_at)}</span>
            <span className="text-xs text-muted">조회 {post.view_count + 1}</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthor ? (
              <>
                <Link
                  href={`/edit/${post.id}`}
                  className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                  수정
                </Link>
                <DeletePostButton postId={post.id} />
              </>
            ) : null}
            <ReportDialog targetType="post" targetId={post.id} />
          </div>
        </div>
      </div>

      {/* meetup details */}
      {meetup ? (
        <div className="mt-5 rounded-xl border bg-surface p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent-soft">
              오프라인
            </span>
            {meetup.is_regular_member_only ? (
              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent-soft">
                정회원 전용
              </span>
            ) : null}
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm text-muted sm:grid-cols-2">
            {meetup.region ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" aria-hidden />
                지역: <span className="text-foreground">{meetup.region}</span>
              </div>
            ) : null}
            {meetup.meetup_date ? (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent" aria-hidden />
                날짜: <span className="text-foreground">{meetup.meetup_date}</span>
              </div>
            ) : null}
            {meetup.meetup_time ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" aria-hidden />
                시간: <span className="text-foreground">{meetup.meetup_time.slice(0, 5)}</span>
              </div>
            ) : null}
            {meetup.venue ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" aria-hidden />
                장소: <span className="text-foreground">{meetup.venue}</span>
              </div>
            ) : null}
            {meetup.capacity ? (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" aria-hidden />
                모집 인원: <span className="text-foreground">{meetup.capacity}명</span>
              </div>
            ) : null}
            {meetup.fee ? (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" aria-hidden />
                참가비: <span className="text-foreground">{meetup.fee}</span>
              </div>
            ) : null}
          </dl>

          {meetup.has_application_url ? (
            applicationUrl ? (
              <a
                href={applicationUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                모임 신청하기
              </a>
            ) : (
              <p className="mt-4 rounded-lg border bg-surface-soft px-4 py-3 text-sm text-muted">
                {profile?.is_suspended
                  ? MEETUP_LINK_SUSPENDED_MESSAGE
                  : MEETUP_LINK_RESTRICTED_MESSAGE}
              </p>
            )
          ) : null}
        </div>
      ) : null}

      {/* content */}
      <div className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground">
        {post.content}
      </div>

      {images.length > 0 ? (
        <div className="mt-6 space-y-3">
          {images.map((image) => (
            <Image
              key={image.id}
              src={image.image_url}
              alt=""
              width={768}
              height={512}
              className="h-auto w-full rounded-xl border object-contain"
            />
          ))}
        </div>
      ) : null}

      {post.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="rounded-full bg-surface-soft px-3 py-1 text-xs text-accent-soft hover:bg-surface-soft/70"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      {/* actions */}
      <div className="mt-8 flex justify-center border-b pb-8">
        <PostActions
          postId={post.id}
          liked={!!likeRes.data}
          bookmarked={!!bookmarkRes.data}
          likeCount={post.like_count}
          bookmarkCount={post.bookmark_count}
        />
      </div>

      {/* comments */}
      <section className="mt-8">
        <h2 className="font-semibold text-foreground">댓글 {comments.length}</h2>

        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <AuthorLabel
                  nickname={comment.author?.nickname}
                  level={comment.author?.member_level}
                  operator={!comment.author_id}
                  className="text-xs"
                />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatDateTime(comment.created_at)}</span>
                  {user && comment.author_id === user.id ? (
                    <DeleteCommentButton commentId={comment.id} postId={post.id} />
                  ) : (
                    <ReportDialog targetType="comment" targetId={comment.id} />
                  )}
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {comment.content}
              </p>
            </div>
          ))}
          {comments.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-surface px-4 py-8 text-center text-sm text-muted">
              아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          {profile?.is_suspended ? (
            <p className="rounded-lg border bg-surface px-4 py-3 text-sm text-muted">
              현재 계정 상태에서는 댓글을 작성할 수 없습니다.
            </p>
          ) : (
            <CommentForm postId={post.id} />
          )}
        </div>
      </section>
    </article>
  );
}
