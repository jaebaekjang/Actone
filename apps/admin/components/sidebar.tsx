"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn, type AdminPermission } from "@actone/shared";
import { NAV_GROUPS } from "./nav-config";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function visibleGroups(permissions: AdminPermission[]) {
  const permSet = new Set(permissions);
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.perm || permSet.has(item.perm)),
  })).filter((group) => group.items.length > 0);
}

function NavList({
  permissions,
  onNavigate,
}: {
  permissions: AdminPermission[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6 px-3 py-5">
      {visibleGroups(permissions).map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent/15 font-medium text-accent-soft"
                      : "text-muted hover:bg-surface-soft hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/** Fixed desktop sidebar. */
export function Sidebar({ permissions }: { permissions: AdminPermission[] }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-surface lg:block">
      <div className="sticky top-0 max-h-screen overflow-y-auto">
        <NavList permissions={permissions} />
      </div>
    </aside>
  );
}

/** Mobile hamburger trigger + slide-in drawer. Rendered inside the header. */
export function MobileNav({ permissions }: { permissions: AdminPermission[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-surface text-foreground"
        aria-label="메뉴 열기"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-64 overflow-y-auto border-r bg-surface">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold text-foreground">메뉴</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-soft"
                aria-label="메뉴 닫기"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <NavList permissions={permissions} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
