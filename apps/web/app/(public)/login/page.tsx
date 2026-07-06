import type { Metadata } from "next";
import Link from "next/link";
import { KakaoLoginButton } from "@/components/kakao-login-button";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-foreground">액트원 시작하기</h1>
      <p className="mt-3 leading-relaxed text-muted">
        인맥 없이 배우를 시작했다면,
        <br />
        혼자 버티지 않아도 됩니다.
      </p>

      <div className="mt-10 w-full space-y-3">
        <KakaoLoginButton label="카카오로 로그인" className="w-full" />
        <KakaoLoginButton label="카카오로 시작하기" className="w-full" />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        액트원은 카카오 로그인만 지원합니다.
        <br />
        처음이어도 같은 버튼으로 시작할 수 있습니다.
      </p>

      <p className="mt-8 text-xs text-muted">
        로그인하면{" "}
        <Link href="/guidelines" className="underline underline-offset-4 hover:text-foreground">
          커뮤니티 이용수칙
        </Link>
        에 동의한 것으로 간주됩니다.
      </p>
    </div>
  );
}
