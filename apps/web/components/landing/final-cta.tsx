import { KakaoLoginButton } from "@/components/kakao-login-button";

export function FinalCta() {
  return (
    <section className="stage-light">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
        <p className="t-label">Curtain Call</p>
        <h2 className="t-display mt-4 text-2xl text-foreground md:text-3xl">
          오늘도 혼자 버티고 있다면,
          <br />
          이제 함께 버텨요.
        </h2>
        <p className="mx-auto mt-5 max-w-md leading-relaxed text-muted">
          오디션에 떨어진 날도, 현장에서 당황한 날도, 다시 시작하고 싶은 날도
          액트원에서 이야기할 수 있습니다.
        </p>
        <div className="mt-9 flex justify-center">
          <KakaoLoginButton label="카카오로 대기실 입장하기" />
        </div>
      </div>
    </section>
  );
}
