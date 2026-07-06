import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@actone/shared";

/**
 * Festival-style section heading: red eyebrow, mixed-weight headline,
 * optional pill link with a circled arrow (BIFF pattern).
 */
export function SectionHeader({
  eyebrow,
  strong,
  rest,
  sub,
  href,
  linkLabel,
}: {
  eyebrow: string;
  strong: string;
  rest?: string;
  sub?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[13px] font-bold tracking-wide text-festival">{eyebrow}</p>
        <h2 className="t-display mt-2.5 text-xl text-foreground md:text-[1.625rem]">
          {strong}
          {rest ? <span className="font-normal text-foreground/80">{rest}</span> : null}
        </h2>
        {sub ? <p className="mt-2 text-sm leading-relaxed text-muted">{sub}</p> : null}
      </div>
      {href && linkLabel ? <PillLink href={href} label={linkLabel} /> : null}
    </div>
  );
}

export function PillLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2.5 rounded-full border border-foreground/25 py-1.5 pl-4 pr-1.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground/60",
        className,
      )}
    >
      {label}
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 transition-colors group-hover:bg-festival">
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Link>
  );
}
