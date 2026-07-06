"use client";

import { useTransition } from "react";
import { Bookmark, Heart } from "lucide-react";
import { cn } from "@actone/shared";
import { toggleBookmark, toggleLike } from "@/lib/actions/engagement";

export function PostActions({
  postId,
  liked,
  bookmarked,
  likeCount,
  bookmarkCount,
}: {
  postId: string;
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleLike(postId))}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm transition-colors disabled:opacity-60",
          liked
            ? "border-accent/50 bg-accent/10 text-accent-soft"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-accent text-accent")} aria-hidden />
        좋아요 {likeCount}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleBookmark(postId))}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm transition-colors disabled:opacity-60",
          bookmarked
            ? "border-accent/50 bg-accent/10 text-accent-soft"
            : "bg-surface text-muted hover:text-foreground",
        )}
      >
        <Bookmark
          className={cn("h-4 w-4", bookmarked && "fill-accent text-accent")}
          aria-hidden
        />
        북마크 {bookmarkCount}
      </button>
    </div>
  );
}
