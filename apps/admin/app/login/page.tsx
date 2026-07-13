import type { Metadata } from "next";
import { KakaoLoginButton } from "@/components/kakao-login-button";

export const metadata: Metadata = { title: "로그인" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-accent">관리자 콘솔</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">액트원 관리자</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        관리자 권한이 있는 계정으로만 접속할 수 있습니다.
      </p>
      <div className="mt-8 w-full">
        <KakaoLoginButton label="카카오로 로그인" className="w-full" />
      </div>
    </div>
  );
}
