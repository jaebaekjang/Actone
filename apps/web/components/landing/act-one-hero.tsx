import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { KakaoLoginButton } from "@/components/kakao-login-button";
import { buttonStyles } from "@/components/ui/button";

const HERO_NOTES = [
  {
    category: "배우 생존방",
    title: "배우를 계속해도 되는지 모르겠을 때",
    comments: 12,
    tilt: "md:-rotate-1",
    drift: "drift",
  },
  {
    category: "현장 후기방",
    title: "첫 촬영장에서 미리 알았으면 좋았을 것들",
    comments: 15,
    tilt: "md:rotate-1",
    drift: "drift-delayed",
  },
  {
    category: "스터디",
    title: "독백 스터디 같이 할 사람 있나요?",
    comments: 6,
    tilt: "md:-rotate-[0.5deg]",
    drift: "drift",
  },
];

export function ActOneHero() {
  return (
    <section className="stage-light border-b">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-20 md:pb-24 md:pt-28">
        <p className="t-label">배우들의 온라인 대기실</p>
        <h1 className="t-display mt-5 text-[1.75rem] text-foreground sm:text-4xl md:text-5xl">
          인맥 없이 배우를 시작했다면,
          <br />
          혼자 버티지 않아도 됩니다.
        </h1>
        <p className="mt-6 max-w-xl leading-relaxed text-muted">
          액트원은 오디션 정보, 현장 후기, 오프라인 모임, 스터디, 배우 생존
          이야기를 함께 나누는 배우 커뮤니티입니다.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <KakaoLoginButton label="카카오로 대기실 입장하기" className="w-full sm:w-auto" />
          <Link
            href="#waiting-room"
            className={buttonStyles("secondary", "lg", "w-full sm:w-auto")}
          >
            커뮤니티 먼저 둘러보기
          </Link>
        </div>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-dim">
          캐스팅 중개도, 유료 강의도, 배우 DB도 아닙니다.
          <br />
          같은 길 위에 있는 배우들이 모이는 작은 온라인 대기실입니다.
        </p>

        {/* notes pinned on the wall of the waiting room */}
        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {HERO_NOTES.map((note) => (
            <div
              key={note.title}
              className={`pinned-note paper-card rounded-lg p-4 ${note.tilt} ${note.drift}`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-dashed pb-2">
                <span className="text-xs font-bold text-accent-soft">{note.category}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent/70" aria-hidden />
              </div>
              <p className="mt-2.5 text-sm font-bold leading-snug text-foreground">
                {note.title}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
                <MessageCircle className="h-3 w-3" aria-hidden />
                댓글 {note.comments}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
