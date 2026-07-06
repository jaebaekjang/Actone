import Link from "next/link";
import { Lock, MessageCircle } from "lucide-react";

const PREVIEW_POSTS = [
  { category: "배우 생존방", title: "배우를 계속해도 되는지 모르겠을 때", comments: 12 },
  { category: "현장 후기방", title: "첫 촬영장에서 미리 알았으면 좋았을 것들", comments: 15 },
  { category: "오프라인 모임", title: "액트원 첫 오프라인 모임이 열린다면?", comments: 8 },
  { category: "스터디방", title: "독백 스터디 같이 할 사람 있나요?", comments: 6 },
  { category: "오디션 정보방", title: "단편영화 지원 전 꼭 확인해야 할 것들", comments: 9 },
];

export function WaitingRoomPreview() {
  return (
    <section id="waiting-room" className="border-b bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <p className="t-label">Act 01 · Live Board</p>
        <h2 className="t-display mt-3 text-xl text-foreground md:text-2xl">
          지금 대기실에서 오가는 이야기
        </h2>
        <p className="mt-2 text-sm text-muted">
          로그인 전에도 액트원의 분위기를 먼저 느껴볼 수 있어요.
        </p>

        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {PREVIEW_POSTS.map((post, index) => (
            <Link
              key={post.title}
              href="/login"
              className={`pinned-note group rounded-lg border bg-background p-4 ${
                index === PREVIEW_POSTS.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-accent-soft">{post.category}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-dim">
                  <Lock className="h-3 w-3" aria-hidden />
                  로그인 후 열람
                </span>
              </div>
              <p className="mt-2 font-semibold leading-snug text-foreground">{post.title}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  댓글 {post.comments}
                </span>
                <span className="text-xs text-dim transition-colors group-hover:text-accent-soft">
                  입장해서 읽기 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
