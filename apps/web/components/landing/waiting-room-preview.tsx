import Link from "next/link";
import { Lock, MessageCircle } from "lucide-react";
import { SectionHeader } from "./section-header";

const PREVIEW_POSTS = [
  {
    category: "배우 생존방",
    title: "배우를 계속해도 되는지 모르겠을 때",
    comments: 12,
    tags: ["고민", "멘탈"],
    tint: "from-[#2b2036]",
  },
  {
    category: "현장 후기방",
    title: "첫 촬영장에서 미리 알았으면 좋았을 것들",
    comments: 15,
    tags: ["촬영후기", "조심할점"],
    tint: "from-[#16302e]",
  },
  {
    category: "오프라인 모임",
    title: "액트원 첫 오프라인 모임이 열린다면?",
    comments: 8,
    tags: ["서울", "네트워킹"],
    tint: "from-[#3a1418]",
  },
  {
    category: "스터디방",
    title: "독백 스터디 같이 할 사람 있나요?",
    comments: 6,
    tags: ["독백스터디", "대본리딩"],
    tint: "from-[#33260f]",
  },
  {
    category: "오디션 정보방",
    title: "단편영화 지원 전 꼭 확인해야 할 것들",
    comments: 9,
    tags: ["단편영화", "마감일"],
    tint: "from-[#1d2438]",
  },
];

export function WaitingRoomPreview() {
  return (
    <section id="waiting-room" className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <SectionHeader
          eyebrow="대기실 게시판"
          strong="지금 대기실에서 오가는 이야기"
          rest="를 만나보세요"
          sub="로그인 전에도 액트원의 분위기를 먼저 느껴볼 수 있어요."
          href="/login"
          linkLabel="전체 둘러보기"
        />

        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {PREVIEW_POSTS.map((post) => (
            <Link
              key={post.title}
              href="/login"
              className={`ticket-card group relative flex aspect-[3/4] w-56 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-b ${post.tint} to-background p-4 motion-reduce:hover:translate-y-0 md:w-60`}
              style={{ "--notch-bg": "var(--color-background)" } as React.CSSProperties}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground/90">{post.category}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-foreground/45">
                  <Lock className="h-3 w-3" aria-hidden />
                  로그인
                </span>
              </div>

              <div>
                <p className="text-[17px] font-extrabold leading-snug text-foreground">
                  {post.title}
                </p>
                <p className="mt-2.5 inline-flex items-center gap-1 text-xs text-foreground/60">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  댓글 {post.comments}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] text-foreground/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <span
                className="pointer-events-none absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/[0.04]"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
