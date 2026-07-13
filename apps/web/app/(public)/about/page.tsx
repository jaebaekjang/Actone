import type { Metadata } from "next";
import Link from "next/link";
import { KakaoLoginButton } from "@/components/kakao-login-button";

export const metadata: Metadata = { title: "소개" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[760px] px-5 py-16 md:px-8 md:py-24">
      <p className="text-sm font-medium text-accent-soft">소개</p>
      <h1 className="mt-3 text-[27px] font-semibold tracking-tight text-foreground md:text-[36px]">
        액트원은 어떤 곳인가요
      </h1>

      <blockquote className="mt-10 border-l-2 border-accent pl-5 text-[17px] font-medium leading-[1.75] text-foreground md:pl-6 md:text-[19px]">
        액트원은 잘나가는 배우들을 위한 공간이 아닙니다.
        <br />
        경력이 부족한 사람, 인맥이 없는 사람, 계속 떨어지고 있는 사람, 다시
        시작하고 싶은 사람을 위한 커뮤니티입니다.
      </blockquote>

      <section className="mt-14 border-t pt-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">왜 만들었나요</h2>
        <p className="mt-4 text-[15px] leading-[1.8] text-muted md:text-base">
          연기를 시작하는 데 필요한 건 재능만이 아닙니다. 정보와 사람입니다.
          하지만 인맥 없이 시작한 배우에게는 둘 다 없습니다. 액트원은 그
          공백을 커뮤니티로 채웁니다. 오디션 정보를 나누고, 현장에서 겪은 일을
          공유하고, 오프라인에서 만나 서로의 동료가 됩니다.
        </p>
      </section>

      <section className="mt-12 border-t pt-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
          어떤 커뮤니티가 되려고 하나요
        </h2>
        <ul className="mt-4 space-y-3 text-[15px] leading-[1.8] text-muted md:text-base">
          <li className="flex gap-3">
            <span className="mt-[0.72em] h-px w-4 shrink-0 bg-accent" aria-hidden />
            안전한 대기실 — 배우 생활의 고민을 솔직하게 꺼낼 수 있는 곳
          </li>
          <li className="flex gap-3">
            <span className="mt-[0.72em] h-px w-4 shrink-0 bg-accent" aria-hidden />
            진지한 배우 커뮤니티 — 서로의 시간을 존중하는 실용적인 정보
          </li>
          <li className="flex gap-3">
            <span className="mt-[0.72em] h-px w-4 shrink-0 bg-accent" aria-hidden />
            따뜻하지만 유치하지 않게, 솔직하지만 공격적이지 않게
          </li>
        </ul>
      </section>

      <section className="mt-12 border-t pt-8">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
          액트원이 하지 않는 것
        </h2>
        <ul className="mt-4 space-y-3 text-[15px] leading-[1.8] text-muted md:text-base">
          <li>캐스팅 중개나 소속사 매칭을 하지 않습니다.</li>
          <li>배우 데이터베이스를 만들어 검색하게 하지 않습니다.</li>
          <li>유료 구독이나 강의를 팔지 않습니다.</li>
          <li>익명 뒤에 숨은 비방을 허용하지 않습니다.</li>
        </ul>
      </section>

      <div className="mt-14 flex flex-col items-start gap-4 border-t pt-10 sm:flex-row sm:items-center">
        <KakaoLoginButton label="카카오로 시작하기" />
        <Link
          href="/guidelines"
          className="text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-foreground"
        >
          커뮤니티 이용수칙 보기
        </Link>
      </div>
    </div>
  );
}
