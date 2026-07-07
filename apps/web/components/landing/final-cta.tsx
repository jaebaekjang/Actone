import { KakaoLoginButton } from "@/components/kakao-login-button";
import { MicStand, StageCamera } from "./stage-decor";

/**
 * CURTAIN CALL — final stage moment.
 * Crimson valance, standing mic at center, cameras filming from both sides,
 * the last bright moment before the finale.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-black/10 bg-kakao text-black">
      <div className="curtain-edge" aria-hidden />
      {/* stage cameras filming from the bottom corners */}
      <StageCamera
        glintId="stage-camera-left"
        className="pointer-events-none absolute bottom-8 left-2 w-20 text-black/75 md:bottom-12 md:left-6 md:w-28 lg:left-10 lg:w-32"
      />
      <StageCamera
        glintId="stage-camera-right"
        className="pointer-events-none absolute bottom-8 right-2 w-20 -scale-x-100 text-black/75 md:bottom-12 md:right-6 md:w-28 lg:right-10 lg:w-32"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
        <MicStand className="mx-auto h-16 text-black/88 md:h-20" />

        <p className="mt-6 font-mono text-[11px] font-semibold tracking-[0.35em] text-black/55">
          ✨ CURTAIN CALL ✨
        </p>
        <p className="mt-3 text-sm font-bold tracking-wide text-black/65">무대의 조명이 켜집니다</p>

        <h2 className="mt-6 text-[clamp(2.25rem,6.5vw,4.5rem)] font-extrabold leading-[1.12] tracking-tight text-black">
          오늘도 혼자 버티고 있다면,
          <br />
          이제 함께 버텨요.
        </h2>

        <p className="mx-auto mt-8 max-w-md leading-relaxed text-black/70">
          오디션에 떨어진 날도, 현장에서 당황한 날도, 다시 시작하고 싶은 날도
          액트원에서 이야기할 수 있습니다.
        </p>

        <div className="mt-12 flex justify-center">
          <KakaoLoginButton
            label="카카오로 대기실 입장하기"
            className="microphone-button border-2 border-black/20 bg-black px-8 text-kakao shadow-lg hover:border-black/40 hover:bg-black/95"
          />
        </div>
      </div>
    </section>
  );
}
