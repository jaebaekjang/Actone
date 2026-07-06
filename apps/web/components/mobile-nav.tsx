"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, Search, User } from "lucide-react";
import { cn } from "@actone/shared";

const ITEMS = [
  { href: "/community", label: "홈", icon: Home },
  { href: "/search", label: "검색", icon: Search },
  { href: "/write", label: "글쓰기", icon: PenLine },
  { href: "/me", label: "마이", icon: User },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-surface md:hidden">
      <div className="grid grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                active ? "text-accent" : "text-muted",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
