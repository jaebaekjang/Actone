import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KakaoLoginButton } from "@/components/kakao-login-button";

export function ActOneHero() {
  return (
    <section className="festival-hero border-b">
      <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col items-center justify-center px-4 py-24 text-center md:min-h-[86vh] md:py-32">
        <div data-parallax>
          <p className="text-sm font-bold tracking-wide text-foreground/85">
            멈추지 않는 배우들의 이야기
          </p>
          <p className="mt-4 text-xl font-medium text-foreground/90 md:text-2xl">
            인맥 없이 배우를 시작했다면,
          </p>
          <h1 className="t-display mt-2 text-[clamp(2.75rem,8.5vw,7rem)] leading-[1.12] text-foreground">
            혼자 버티지
            <br className="sm:hidden" /> 않아도 됩니다.
          </h1>
        </div>
        <p className="mx-auto mt-9 max-w-xl leading-relaxed text-foreground/75">
          액트원은 오디션 정보, 현장 후기, 오프라인 모임, 스터디, 배우 생존
          이야기를 함께 나누는 배우 커뮤니티입니다.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <KakaoLoginButton label="카카오로 대기실 입장하기" className="w-full sm:w-auto" />
          <Link
            href="#waiting-room"
            className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-foreground/30 pl-6 pr-2 text-base font-semibold text-foreground transition-colors hover:border-foreground/70 sm:w-auto"
          >
            커뮤니티 먼저 둘러보기
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 transition-colors group-hover:bg-festival">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        </div>

        <p className="mt-7 max-w-md text-sm leading-relaxed text-foreground/55">
          캐스팅 중개도, 유료 강의도, 배우 DB도 아닙니다.
          <br />
          같은 길 위에 있는 배우들이 모이는 작은 온라인 대기실입니다.
        </p>
      </div>
    </section>
  );
}
