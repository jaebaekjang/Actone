import { cn } from "@actone/shared";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-accent text-[#141416] font-semibold hover:bg-accent-soft",
  secondary: "border bg-surface-soft text-foreground hover:border-accent/40 hover:bg-surface-soft/70",
  ghost: "text-muted hover:bg-surface-soft hover:text-foreground",
  danger: "bg-red-800 text-white hover:bg-red-700",
  kakao:
    "bg-kakao font-semibold text-black shadow-[0_2px_0_rgba(0,0,0,0.55),0_10px_24px_rgba(254,229,0,0.10)] hover:brightness-[0.97]",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[color,background-color,border-color,box-shadow,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:translate-y-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function buttonStyles(
  variant: keyof typeof variants = "primary",
  size: keyof typeof sizes = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[color,background-color,border-color,box-shadow,transform] active:translate-y-px motion-reduce:active:translate-y-0",
    variants[variant],
    sizes[size],
    className,
  );
}
