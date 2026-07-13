"use client";

import { useTransition } from "react";
import { cn } from "@actone/shared";

/** small action button that optionally confirms, then runs a bound server action */
export function ConfirmButton({
  action,
  children,
  confirmMessage,
  tone = "neutral",
  className,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
  confirmMessage?: string;
  tone?: "neutral" | "danger" | "positive";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  const tones = {
    neutral: "border bg-surface text-foreground hover:bg-surface-soft",
    danger: "border border-danger/40 bg-danger/5 text-danger hover:bg-danger/10",
    positive: "border border-success/40 bg-success/5 text-success hover:bg-success/10",
  } as const;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(() => action());
      }}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors disabled:opacity-50",
        tones[tone],
        className,
      )}
    >
      {pending ? "처리 중…" : children}
    </button>
  );
}
