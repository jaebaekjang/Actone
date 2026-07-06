import Link from "next/link";
import {
  BookOpen,
  Clapperboard,
  Coffee,
  HeartHandshake,
  Megaphone,
  MessagesSquare,
  Users,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@actone/shared";

const ICONS: Record<string, LucideIcon> = {
  "offline-meetups": Users,
  "actor-survival": HeartHandshake,
  "audition-info": Clapperboard,
  study: BookOpen,
  "field-reviews": MessagesSquare,
  "free-board": Coffee,
  resources: FolderOpen,
  notices: Megaphone,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = ICONS[category.slug] ?? MessagesSquare;
  return (
    <Link
      href={`/community/${category.slug}`}
      className="flex items-start gap-3 rounded-xl border bg-surface p-4 transition-colors hover:border-accent/40"
    >
      <span className="rounded-lg bg-accent/10 p-2 text-accent">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span>
        <span className="block font-semibold text-foreground">{category.name}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">
          {category.description}
        </span>
      </span>
    </Link>
  );
}
