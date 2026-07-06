import { KakaoLoginButton } from "@/components/kakao-login-button";

/**
 * The stage lights up: after a dark theater lobby the page ends on a single
 * kakao-yellow band — the one full-bleed color moment on the landing page.
 */
export function FinalCta() {
  return (
    <section className="border-t border-black/10 bg-kakao text-black">
      <div className="mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
        <p className="text-sm font-bold tracking-wide text-black/60">무대의 조명이 켜집니다</p>
        <h2 className="mt-5 text-[clamp(2.25rem,6.5vw,4.5rem)] font-extrabold leading-[1.12] tracking-tight text-black">
          오늘도 혼자 버티고 있다면,
          <br />
          이제 함께 버텨요.
        </h2>
        <p className="mx-auto mt-6 max-w-md leading-relaxed text-black/70">
          오디션에 떨어진 날도, 현장에서 당황한 날도, 다시 시작하고 싶은 날도
          액트원에서 이야기할 수 있습니다.
        </p>
        <div className="mt-10 flex justify-center">
          <KakaoLoginButton
            label="카카오로 대기실 입장하기"
            className="border border-black/25 bg-black text-kakao hover:bg-black/90"
          />
        </div>
      </div>
    </section>
  );
}
