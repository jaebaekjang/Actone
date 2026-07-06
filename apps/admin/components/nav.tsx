"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  Flag,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@actone/shared";

const ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/members", label: "회원 관리", icon: Users },
  { href: "/settings", label: "회원 등급 설정", icon: Settings },
  { href: "/posts", label: "게시글 관리", icon: FileText },
  { href: "/comments", label: "댓글 관리", icon: MessageSquare },
  { href: "/reports", label: "신고 관리", icon: Flag },
  { href: "/submissions", label: "자료 제보 관리", icon: FolderOpen },
  { href: "/notices", label: "공지 관리", icon: Megaphone },
  { href: "/categories", label: "카테고리 관리", icon: Tags },
  { href: "/admins", label: "관리자 계정", icon: ShieldCheck },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-surface px-2 py-2 lg:h-full lg:w-56 lg:flex-col lg:border-b-0 lg:border-r lg:px-3 lg:py-4">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent/15 font-medium text-accent-soft"
                : "text-muted hover:bg-surface-soft hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
