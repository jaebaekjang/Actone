import { cn, MEMBER_LEVEL_LABELS, type MemberLevel } from "@actone/shared";
import { Star } from "lucide-react";

export function MemberLevelBadge({
  level,
  className,
}: {
  level: MemberLevel | null | undefined;
  className?: string;
}) {
  if (!level) return null;

  if (level === "tutor") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-gold/60 bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold",
          className,
        )}
      >
        <Star className="h-3 w-3 fill-gold" aria-hidden />
        {MEMBER_LEVEL_LABELS.tutor}
      </span>
    );
  }

  if (level === "regular_member") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-soft",
          className,
        )}
      >
        {MEMBER_LEVEL_LABELS.regular_member}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-surface-soft px-2 py-0.5 text-xs text-muted",
        className,
      )}
    >
      {MEMBER_LEVEL_LABELS.new_member}
    </span>
  );
}

/** nickname + level badge; null author → 액트원 운영진 */
export function AuthorLabel({
  nickname,
  level,
  operator = false,
  className,
}: {
  nickname?: string | null;
  level?: MemberLevel | null;
  operator?: boolean;
  className?: string;
}) {
  if (operator || !nickname) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
        <span className="font-medium text-foreground">액트원 운영진</span>
        <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-soft">
          운영진
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span className="font-medium text-foreground">{nickname}</span>
      <MemberLevelBadge level={level} />
    </span>
  );
}
