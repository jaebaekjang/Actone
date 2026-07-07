import { KakaoLoginButton } from "@/components/kakao-login-button";
import { MicStand, StageCamera } from "./stage-decor";

/**
 * Curtain call: after a dark theater lobby the page ends on a single
 * kakao-yellow band — crimson curtain valance above, film cameras shooting
 * from the corners, a standing mic waiting at center stage.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-black/10 bg-kakao text-black">
      <div className="curtain-edge" aria-hidden />
      <StageCamera
        glintId="stage-camera-left"
        className="pointer-events-none absolute bottom-5 left-4 hidden w-24 text-black/80 md:block lg:left-8 lg:w-28"
      />
      <StageCamera
        glintId="stage-camera-right"
        className="pointer-events-none absolute bottom-5 right-4 hidden w-24 -scale-x-100 text-black/80 md:block lg:right-8 lg:w-28"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
        <MicStand className="mx-auto h-14 text-black/85 md:h-16" />
        <p className="mt-5 font-mono text-[11px] font-semibold tracking-[0.35em] text-black/45">
          CURTAIN CALL
        </p>
        <p className="mt-2 text-sm font-bold tracking-wide text-black/60">무대의 조명이 켜집니다</p>
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
            className="microphone-button border border-black/25 bg-black px-7 text-kakao hover:bg-black/90"
          />
        </div>
      </div>
    </section>
  );
}
