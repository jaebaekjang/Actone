import Link from "next/link";
import { KakaoLoginButton } from "@/components/kakao-login-button";
import { buttonStyles } from "@/components/ui/button";

// 실제 seed 데이터(supabase/seed.sql)와 같은 톤의 카테고리/글/모임 예시로 구성한 미리보기.
// 가짜 회원 수, 후기, 통계는 넣지 않는다 (ACTONE_DESIGN_SYSTEM.md — 콘텐츠 리얼리즘).
const MEETUP_PREVIEWS = [
  {
    title: "대본 리딩 번개 — 처음 만나도 부담 없는 소규모 리딩",
    region: "서울 · 홍대",
    format: "소규모 4~6인",
    tags: ["번개", "대본리딩"],
  },
  {
    title: "독립영화 같이 보고 이야기하는 저녁 모임",
    region: "서울 · 종로",
    format: "관람 후 대화",
    tags: ["네트워킹", "독립영화"],
  },
  {
    title: "오디션 준비생 정기 스터디 — 독백과 셀프테이프",
    region: "온라인 + 오프라인",
    format: "격주 정기",
    tags: ["스터디", "오디션준비"],
  },
];

const CATEGORIES = [
  { name: "오프라인 모임", desc: "배우들이 직접 만나 연결되는 모임" },
  { name: "배우 생존방", desc: "혼자 삼켰던 이야기를 꺼내는 곳" },
  { name: "오디션 정보 공유방", desc: "지원할 수 있는 정보를 서로 공유" },
  { name: "스터디", desc: "대본 리딩부터 카메라 연기까지 함께 연습" },
  { name: "현장 후기방", desc: "오디션과 촬영장에서 겪은 경험" },
  { name: "자유게시판", desc: "배우 생활, 일상, 질문, 잡담" },
  { name: "자료실", desc: "지원과 현장 준비에 도움이 되는 자료" },
  { name: "공지사항", desc: "액트원 운영 공지와 업데이트" },
];

const PREVIEW_POSTS = [
  {
    category: "배우 생존방",
    title: "배우를 계속해도 되는지 모르겠을 때",
    excerpt:
      "오디션을 계속 지원해도 연락이 없으면, 어느 순간 실력보다 나 자체가 문제인 것처럼 느껴질 때가 있습니다.",
  },
  {
    category: "현장 후기방",
    title: "첫 촬영장에서 미리 알았으면 좋았을 것들",
    excerpt:
      "처음 촬영장에 갔을 때 용어도 모르고, 어디에 서 있어야 하는지도 몰라서 많이 긴장했습니다.",
  },
  {
    category: "오디션 정보 공유방",
    title: "단편영화 지원할 때 페이 없는 공고도 지원하시나요?",
    excerpt: "경력이 부족한 단계에서는 무페이 단편도 해야 하는지 고민됩니다.",
  },
  {
    category: "스터디",
    title: "대본 리딩 스터디는 어떤 방식이 가장 부담 없을까요?",
    excerpt:
      "처음 만나는 사람들과 대본 리딩을 한다면 온라인이 좋을지, 오프라인이 좋을지 고민됩니다.",
  },
];

const MEMBER_LEVELS = [
  {
    label: "신규회원",
    desc: "카카오 로그인과 온보딩을 마치면 시작되는 기본 등급입니다. 글, 댓글, 좋아요, 북마크, 신고, 자료 제보까지 대부분의 활동이 열려 있습니다.",
  },
  {
    label: "정회원",
    desc: "운영진이 승인한 회원입니다. 오프라인 모임 신청 링크는 정회원부터 확인할 수 있습니다. 얼굴을 보는 모임이기에, 한 단계의 신뢰를 거칩니다.",
  },
  {
    label: "튜터",
    desc: "운영진이 직접 인증한 신뢰 회원입니다. 스터디와 모임, 자료 글에서 튜터 표시로 구분되며, 자동으로 부여되지 않습니다.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* 1. 빈 무대 스포트라이트 히어로 */}
      <section className="stage border-b">
        <div className="stage-cone" aria-hidden />
        <div className="stage-floor" aria-hidden />
        <div className="stage-pool" aria-hidden />
        <div className="stage-grain" aria-hidden />

        <div className="mx-auto flex min-h-[86svh] max-w-[1200px] flex-col px-5 pb-[28svh] pt-16 md:px-8 md:pb-[24svh] md:pt-24 lg:px-10">
          <div className="max-w-2xl md:ml-[4%]">
            <p className="text-sm font-medium tracking-wide text-accent-soft">
              배우 커뮤니티 · 액트원
            </p>
            <h1 className="mt-5 text-[34px] font-semibold leading-[1.3] tracking-tight text-foreground md:text-[54px] md:leading-[1.24]">
              인맥 없이 배우를 시작했다면,
              <br />
              혼자 버티지 않아도 됩니다.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-[1.75] text-muted md:text-lg">
              액트원은 오디션 정보, 현장 후기, 오프라인 모임, 스터디, 배우 생존
              이야기를 함께 나누는 배우 커뮤니티입니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <KakaoLoginButton label="카카오로 시작하기" className="sm:w-auto" />
              <Link href="/about" className={buttonStyles("secondary", "lg", "sm:w-auto")}>
                액트원 소개 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 오프라인 모임 — 히어로 바로 아래, 첫 콘텐츠 */}
      <section className="bg-paper text-paper-ink">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">오프라인 모임</p>
              <h2 className="mt-3 text-[26px] font-semibold leading-snug tracking-tight md:text-[32px]">
                화면 밖에서 동료를 만납니다
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-[1.75] text-paper-muted md:text-base">
                네트워킹, 소규모 모임, 번개, 스터디가 오프라인 모임 게시판에서
                열립니다. 지금 준비하고 있는 모임의 예시입니다.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden border border-paper-line bg-paper-line md:grid-cols-3">
            {MEETUP_PREVIEWS.map((meetup) => (
              <article key={meetup.title} className="flex flex-col bg-paper p-5 md:p-6">
                <div className="flex flex-wrap gap-1.5">
                  {meetup.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-paper-line px-1.5 py-px text-[11px] text-paper-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-3 text-[17px] font-semibold leading-snug">
                  {meetup.title}
                </h3>
                <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 text-[13px] text-paper-muted">
                  <span>{meetup.region}</span>
                  <span>{meetup.format}</span>
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-sm leading-[1.7] text-paper-muted">
            모임 확인과 참여는 카카오 로그인 후 가능합니다. 신청 링크는{" "}
            <strong className="font-semibold text-paper-ink">정회원부터</strong> 열립니다 —
            처음 온 사람을 배제하려는 게 아니라, 얼굴을 보고 만나는 자리를 안전하게
            지키기 위한 절차입니다.
          </p>
        </div>
      </section>

      {/* 3. 게시판 + 글 미리보기 */}
      <section className="border-t bg-surface">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight text-foreground md:text-[28px]">
                8개의 게시판이
                <br />
                열려 있습니다
              </h2>
              <ol className="mt-8 border-t">
                {CATEGORIES.map((category, i) => (
                  <li
                    key={category.name}
                    className="flex items-baseline gap-4 border-b py-3.5"
                  >
                    <span className="tnum w-6 shrink-0 text-xs text-muted/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-24 shrink-0 text-[15px] font-medium text-foreground">
                      {category.name}
                    </span>
                    <span className="hidden text-sm text-muted sm:inline">
                      {category.desc}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="text-[24px] font-semibold tracking-tight text-foreground md:text-[28px]">
                이런 이야기가
                <br />
                시작됩니다
              </h2>
              <div className="mt-8 border-t">
                {PREVIEW_POSTS.map((post) => (
                  <article key={post.title} className="border-b py-5">
                    <p className="text-xs font-medium text-accent-soft">{post.category}</p>
                    <h3 className="mt-1.5 text-[17px] font-semibold leading-snug text-foreground">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-[1.7] text-muted">
                      {post.excerpt}
                    </p>
                  </article>
                ))}
              </div>
              <p className="mt-5 text-sm text-muted">
                커뮤니티 글은 카카오 로그인 후 읽을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 왜 존재하는가 — 편집형 2단 */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24 lg:px-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div>
            <p className="text-sm font-medium text-accent-soft">액트원이 존재하는 이유</p>
            <h2 className="mt-4 text-[26px] font-semibold leading-snug tracking-tight text-foreground md:text-[32px]">
              배우 생활은
              <br />
              자주 혼자입니다.
            </h2>
          </div>
          <div className="space-y-5 text-[15px] leading-[1.8] text-muted md:pt-12 md:text-base">
            <p>
              오디션에 떨어져도, 현장에서 당황해도, 생계가 흔들려도 이야기할 곳이
              없습니다. 필요한 건 재능만이 아니라 정보와 사람인데, 인맥 없이 시작한
              배우에게는 둘 다 없습니다.
            </p>
            <p>
              액트원은 그 공백을 커뮤니티로 채웁니다. 잘나가는 배우들을 위한 공간이
              아니라, 경력이 부족한 사람, 계속 떨어지고 있는 사람, 다시 시작하고
              싶은 사람이 서로의 경험과 정보를 나누며 함께 버티는 공간입니다.
            </p>
            <Link
              href="/about"
              className="inline-block text-sm text-foreground underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
            >
              액트원이 하지 않는 것까지 읽어보기
            </Link>
          </div>
        </div>
      </section>

      {/* 5. 등급과 안전 장치 */}
      <section className="border-t">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24 lg:px-10">
          <div className="max-w-2xl">
            <h2 className="text-[24px] font-semibold tracking-tight text-foreground md:text-[28px]">
              안심하고 이야기할 수 있도록
            </h2>
            <p className="mt-3 text-[15px] leading-[1.8] text-muted">
              액트원의 모든 글에는 작성자의 등급이 함께 표시되고, 문제가 되는 글은
              신고와 운영진 검토를 거칩니다. 익명 게시판은 없습니다.
            </p>
          </div>

          <dl className="mt-10 border-t">
            {MEMBER_LEVELS.map((level) => (
              <div
                key={level.label}
                className="grid gap-2 border-b py-6 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] md:gap-8"
              >
                <dt className="text-[17px] font-semibold text-foreground">{level.label}</dt>
                <dd className="max-w-2xl text-[15px] leading-[1.8] text-muted">
                  {level.desc}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm text-muted">
            실명 저격, 확인되지 않은 폭로, 혐오 표현은{" "}
            <Link
              href="/guidelines"
              className="text-foreground underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
            >
              커뮤니티 이용수칙
            </Link>
            에 따라 제한됩니다.
          </p>
        </div>
      </section>

      {/* 6. 마지막 CTA — 조용한 스포트라이트 잔광 */}
      <section className="stage-echo border-t">
        <div className="mx-auto max-w-[1200px] px-5 py-24 text-center md:px-8 md:py-32 lg:px-10">
          <h2 className="text-[26px] font-semibold leading-snug tracking-tight text-foreground md:text-[34px]">
            오늘도 혼자 버티고 있다면,
            <br />
            이제 함께 버텨요.
          </h2>
          <div className="mt-9 flex justify-center">
            <KakaoLoginButton label="카카오로 시작하기" />
          </div>
          <p className="mt-5 text-sm text-muted">
            이메일 가입은 없습니다. 카카오 로그인 하나로 시작합니다.
          </p>
        </div>
      </section>
    </div>
  );
}
