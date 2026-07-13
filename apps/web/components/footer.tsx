import Link from "next/link";
import { siteConfig } from "@actone/shared";
import { SocialLinks } from "./social-links";

export function Footer() {
  const { company } = siteConfig;
  return (
    <footer className="border-t bg-surface pb-20 md:pb-0">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 px-5 py-12 md:flex-row md:justify-between md:px-8 lg:px-10">
        <div className="space-y-3">
          <p className="flex items-baseline gap-1.5 text-lg font-bold tracking-tight text-foreground">
            액트원
            <span className="mb-0.5 inline-block h-1.5 w-1.5 self-end bg-accent" aria-hidden />
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            인맥 없이 배우를 시작했다면,
            <br />
            혼자 버티지 않아도 됩니다.
          </p>
          <nav className="flex gap-5 pt-2 text-sm text-muted">
            <Link href="/about" className="transition-colors hover:text-foreground">
              소개
            </Link>
            <Link href="/guidelines" className="transition-colors hover:text-foreground">
              커뮤니티 이용수칙
            </Link>
          </nav>
        </div>

        <div className="space-y-4 md:text-right">
          <div className="space-y-1 text-xs leading-relaxed text-muted">
            <p className="font-medium text-foreground/80">{company.name}</p>
            <p>대표: {company.ceo}</p>
            <p className="tnum">사업자번호: {company.businessNumber}</p>
            <p className="max-w-72 md:ml-auto">주소지: {company.address}</p>
            <p className="tnum">대표전화번호: {company.phone}</p>
          </div>
          <SocialLinks />
        </div>
      </div>
      <div className="border-t px-5 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {company.name}. All rights reserved.
      </div>
    </footer>
  );
}
