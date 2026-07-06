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
    neutral: "border bg-surface-soft text-foreground hover:bg-surface-soft/70",
    danger: "border border-red-800/60 bg-red-950/40 text-red-300 hover:bg-red-950/70",
    positive:
      "border border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70",
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
