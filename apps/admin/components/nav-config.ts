import type { AdminPermission } from "@actone/shared";
import {
  FileText,
  FolderOpen,
  Flag,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** permission required to see this item; undefined = visible to any admin */
  perm?: AdminPermission;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "개요",
    items: [{ href: "/", label: "대시보드", icon: LayoutDashboard, perm: "dashboard.view" }],
  },
  {
    label: "회원 운영",
    items: [
      { href: "/members", label: "회원 관리", icon: Users, perm: "members.view" },
      { href: "/settings", label: "회원 등급 설정", icon: Settings, perm: "members.level" },
    ],
  },
  {
    label: "커뮤니티 운영",
    items: [
      { href: "/posts", label: "게시글 관리", icon: FileText, perm: "community.view" },
      { href: "/comments", label: "댓글 관리", icon: MessageSquare, perm: "community.manage" },
      { href: "/reports", label: "신고 관리", icon: Flag, perm: "reports.manage" },
      { href: "/submissions", label: "자료 제보 관리", icon: FolderOpen, perm: "resource.manage" },
      { href: "/notices", label: "공지 관리", icon: Megaphone, perm: "community.manage" },
      { href: "/categories", label: "게시판 관리", icon: Tags, perm: "community.manage" },
    ],
  },
  {
    label: "시스템",
    items: [
      { href: "/admins", label: "관리자 계정", icon: ShieldCheck, perm: "system.admins" },
      { href: "/system/roles", label: "역할·권한", icon: UserCog, perm: "system.roles" },
      { href: "/system/activity-logs", label: "활동 로그", icon: ScrollText, perm: "system.logs" },
    ],
  },
];

/** flat href -> label map for breadcrumbs / page titles */
export const NAV_LABELS: Record<string, string> = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.items.map((i) => [i.href, i.label])),
);
