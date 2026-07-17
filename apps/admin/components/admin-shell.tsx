"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { AdminPermission } from "@actone/shared";
import { MobileNav, Sidebar } from "./sidebar";
import { NAV_LABELS } from "./nav-config";

function currentTitle(pathname: string): string {
  if (pathname === "/") return NAV_LABELS["/"] ?? "대시보드";
  // longest matching nav href wins (handles nested detail routes)
  const match = Object.keys(NAV_LABELS)
    .filter((href) => href !== "/" && (pathname === href || pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];
  return match ? NAV_LABELS[match]! : "관리자";
}

export function AdminShell({
  permissions,
  headerRight,
  children,
}: {
  permissions: AdminPermission[];
  headerRight: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const title = currentTitle(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar permissions={permissions} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-surface/95 px-4 backdrop-blur lg:px-6">
          <div className="lg:hidden">
            <MobileNav permissions={permissions} />
          </div>
          <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="shrink-0 text-muted">관리자</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted/60" aria-hidden />
            <span className="truncate font-semibold text-foreground">{title}</span>
          </nav>
          <div className="ml-auto flex items-center gap-3">{headerRight}</div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
