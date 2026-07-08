import { cn } from "@actone/shared";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "border bg-transparent text-foreground hover:bg-surface-soft",
  ghost: "text-muted hover:bg-surface-soft hover:text-foreground",
  danger: "bg-danger text-white hover:bg-danger/85",
  kakao: "bg-kakao font-semibold text-black hover:brightness-95",
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
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
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
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150",
    variants[variant],
    sizes[size],
    className,
  );
}
