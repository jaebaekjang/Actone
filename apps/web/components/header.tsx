import Link from "next/link";
import { LogOut, PenLine, Search } from "lucide-react";
import { getUserAndProfile } from "@/lib/data";
import { signOut } from "@/lib/actions/auth";
import { buttonStyles } from "./ui/button";
import { MemberLevelBadge } from "./member-level-badge";

export async function Header() {
  const { user, profile } = await getUserAndProfile();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-5 md:px-8 lg:px-10">
        <div className="flex items-baseline gap-8">
          <Link
            href={user ? "/community" : "/"}
            className="flex items-baseline gap-1.5 text-lg font-bold tracking-tight text-foreground"
          >
            액트원
            <span className="mb-0.5 inline-block h-1.5 w-1.5 self-end bg-accent" aria-hidden />
          </Link>
          <nav className="hidden items-baseline gap-6 text-sm text-muted md:flex">
            <Link href="/community" className="transition-colors hover:text-foreground">
              커뮤니티
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              소개
            </Link>
            <Link href="/guidelines" className="transition-colors hover:text-foreground">
              이용수칙
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <Link
                href="/search"
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-soft hover:text-foreground"
                aria-label="검색"
                title="검색"
              >
                <Search className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/write"
                className={buttonStyles("primary", "sm", "hidden md:inline-flex")}
              >
                <PenLine className="h-4 w-4" aria-hidden />
                글쓰기
              </Link>
              <Link
                href="/me"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-soft"
              >
                <span className="max-w-24 truncate">
                  {profile?.nickname ?? "프로필"}
                </span>
                <MemberLevelBadge level={profile?.member_level} />
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-soft hover:text-foreground"
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
