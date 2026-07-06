import Link from "next/link";
import { siteConfig } from "@actone/shared";
import { SocialLinks } from "./social-links";

export function Footer() {
  const { company } = siteConfig;
  return (
    <footer className="border-t bg-surface pb-20 md:pb-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:flex-row md:justify-between">
        <div className="space-y-2">
          <p className="text-lg font-bold text-foreground">{siteConfig.name}</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            인맥 없이 배우를 시작했다면, 혼자 버티지 않아도 됩니다.
          </p>
          <nav className="flex flex-wrap gap-4 pt-2 text-sm text-muted">
            <Link href="/about" className="hover:text-foreground">
              소개
            </Link>
            <Link href="/community" className="hover:text-foreground">
              커뮤니티
            </Link>
            <Link href="/guidelines" className="hover:text-foreground">
              이용수칙
            </Link>
          </nav>
        </div>

        <div className="space-y-3 md:text-right">
          <div className="space-y-1 text-xs leading-relaxed text-muted">
            <p>{company.name}</p>
            <p>대표: {company.ceo}</p>
            <p>사업자번호: {company.businessNumber}</p>
            <p>주소지: {company.address}</p>
            <p>대표전화번호: {company.phone}</p>
          </div>
          <SocialLinks />
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {company.name}. All rights reserved.
      </div>
    </footer>
  );
}
