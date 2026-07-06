import Link from "next/link";
import {
  BookOpen,
  Clapperboard,
  HeartHandshake,
  MessagesSquare,
  Users,
} from "lucide-react";
import { KakaoLoginButton } from "@/components/kakao-login-button";
import { buttonStyles } from "@/components/ui/button";

const SHARE_ITEMS = [
  { icon: Users, title: "오프라인 모임", desc: "같은 길을 걷는 배우들을 직접 만나 연결됩니다." },
  { icon: Clapperboard, title: "오디션 정보", desc: "단편, 독립영화, 연극, 웹드라마 지원 정보를 나눕니다." },
  { icon: MessagesSquare, title: "현장 후기", desc: "오디션과 촬영장에서 겪은 진짜 경험을 공유합니다." },
  { icon: BookOpen, title: "스터디", desc: "대본 리딩, 독백, 카메라 연기를 함께 연습합니다." },
  { icon: HeartHandshake, title: "배우 생존 이야기", desc: "불안, 생계, 슬럼프까지 혼자 삼키지 않아도 됩니다." },
];

const FOR_WHO = [
  "인맥 없이 배우를 시작한 사람",
  "계속 떨어지고 있지만 포기하지 않은 사람",
  "독립영화, 연극, 단편에서 버티고 있는 사람",
  "쉬었다가 다시 시작하려는 사람",
];

const PREVIEW_POSTS = [
  { category: "배우 생존방", title: "배우를 계속해도 되는지 모르겠을 때", comments: 12 },
  { category: "오프라인 모임", title: "액트원 첫 오프라인 모임이 열린다면?", comments: 8 },
  { category: "현장 후기방", title: "첫 촬영장에서 미리 알았으면 좋았을 것들", comments: 15 },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-surface to-background">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
          <h1 className="text-3xl font-bold leading-snug text-foreground md:text-4xl">
            인맥 없이 배우를 시작했다면,
            <br />
            혼자 버티지 않아도 됩니다.
          </h1>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">
            액트원은 오디션 정보, 현장 후기, 오프라인 모임, 스터디, 배우 생존
            이야기를 함께 나누는 배우 커뮤니티입니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <KakaoLoginButton label="카카오로 시작하기" className="w-full sm:w-auto" />
            <Link href="/about" className={buttonStyles("secondary", "lg", "w-full sm:w-auto")}>
              액트원 소개 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-xl font-bold text-foreground">액트원이 존재하는 이유</h2>
        <p className="mt-4 leading-relaxed text-muted">
          배우 생활은 자주 혼자입니다. 오디션에 떨어져도, 현장에서 당황해도,
          생계가 흔들려도 이야기할 곳이 없습니다. 액트원은 잘나가는 배우들을
          위한 공간이 아니라, 인맥 없이 시작한 배우들이 서로의 경험과 정보를
          나누며 함께 버티는 공간입니다.
        </p>
      </section>

      {/* What members share */}
      <section className="border-t bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-xl font-bold text-foreground">이곳에서 나눌 수 있는 것</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHARE_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-background p-5">
                <Icon className="h-6 w-6 text-accent" aria-hidden />
                <p className="mt-3 font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-xl font-bold text-foreground">이런 분들을 위한 커뮤니티입니다</h2>
        <ul className="mt-6 space-y-3">
          {FOR_WHO.map((item) => (
            <li key={item} className="flex items-start gap-3 text-muted">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Community preview */}
      <section className="border-t bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-xl font-bold text-foreground">커뮤니티 미리보기</h2>
          <div className="mt-6 space-y-3">
            {PREVIEW_POSTS.map((post) => (
              <div key={post.title} className="rounded-xl border bg-background p-4">
                <span className="text-xs text-accent-soft">{post.category}</span>
                <p className="mt-1 font-medium text-foreground">{post.title}</p>
                <p className="mt-1 text-xs text-muted">댓글 {post.comments}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            커뮤니티 글은 카카오 로그인 후 읽을 수 있습니다.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold leading-snug text-foreground">
          오늘도 혼자 버티고 있다면,
          <br />
          이제 함께 버텨요.
        </h2>
        <div className="mt-8 flex justify-center">
          <KakaoLoginButton label="카카오로 시작하기" />
        </div>
      </section>
    </div>
  );
}
