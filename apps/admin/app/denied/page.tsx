import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { signOut } from "@/lib/actions";

export const metadata: Metadata = { title: "접근 권한 없음" };

export default function DeniedPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="h-10 w-10 text-danger" aria-hidden />
      <h1 className="mt-4 text-xl font-bold text-foreground">
        접근 권한이 없습니다.
      </h1>
      <p className="mt-2 leading-relaxed text-muted">관리자에게 문의해주세요.</p>
      <form action={signOut} className="mt-8">
        <button
          type="submit"
          className="rounded-lg border bg-surface-soft px-5 py-2.5 text-sm text-foreground hover:bg-surface-soft/70"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
