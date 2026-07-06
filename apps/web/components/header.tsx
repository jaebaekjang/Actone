import Link from "next/link";
import { LogOut, PenLine } from "lucide-react";
import { getUserAndProfile } from "@/lib/data";
import { signOut } from "@/lib/actions/auth";
import { buttonStyles } from "./ui/button";
import { MemberLevelBadge } from "./member-level-badge";

export async function Header() {
  const { user, profile } = await getUserAndProfile();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href={user ? "/community" : "/"} className="text-lg font-bold text-foreground">
            액트원
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted md:flex">
            <Link href="/community" className="hover:text-foreground">
              커뮤니티
            </Link>
            <Link href="/about" className="hover:text-foreground">
              소개
            </Link>
            <Link href="/guidelines" className="hover:text-foreground">
              이용수칙
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/write"
                className={buttonStyles("primary", "sm", "hidden md:inline-flex")}
              >
                <PenLine className="h-4 w-4" aria-hidden />
                글쓰기
              </Link>
              <Link
                href="/me"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-surface-soft"
              >
                <span className="max-w-24 truncate">
                  {profile?.nickname ?? "프로필"}
                </span>
                <MemberLevelBadge level={profile?.member_level} />
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg p-2 text-muted hover:bg-surface-soft hover:text-foreground"
                  aria-label="로그아웃"
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={buttonStyles("secondary", "sm")}>
              카카오로 로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
