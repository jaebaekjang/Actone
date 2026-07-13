import Link from "next/link";
import { cn, type Category } from "@actone/shared";

/** 사이드바/홈의 게시판 인덱스 — 번호가 붙은 조용한 목록. */
export function CategoryIndex({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <ol className="border-t">
      {categories.map((category, i) => (
        <li key={category.id}>
          <Link
            href={`/community/${category.slug}`}
            className={cn(
              "flex items-baseline gap-3 border-b py-2.5 text-sm transition-colors duration-150 hover:text-accent-soft",
              activeSlug === category.slug
                ? "font-medium text-accent-soft"
                : "text-foreground",
            )}
          >
            <span className="tnum w-5 shrink-0 text-xs text-muted/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            {category.name}
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** 모바일 홈 상단의 가로 스크롤 게시판 목록. */
export function CategoryScroller({ categories }: { categories: Category[] }) {
  return (
    <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:-mx-8 md:px-8 lg:hidden">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/community/${category.slug}`}
          className="shrink-0 border px-3 py-1.5 text-sm text-muted transition-colors duration-150 hover:border-accent/60 hover:text-foreground"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
