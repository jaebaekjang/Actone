import { cn, MEMBER_LEVEL_LABELS, type MemberLevel } from "@actone/shared";
import { Star } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const buttonVariants = {
  primary: "bg-accent text-white hover:bg-accent/90",
  secondary: "border bg-surface-soft text-foreground hover:bg-surface-soft/70",
  danger: "bg-red-800 text-white hover:bg-red-700",
  ghost: "text-muted hover:bg-surface-soft hover:text-foreground",
} as const;

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: "sm" | "md";
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

const fieldStyles =
  "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none disabled:opacity-50";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldStyles, "h-10", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldStyles, "min-h-24", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldStyles, "h-10 appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-sm font-medium text-foreground", className)}
    >
      {children}
    </label>
  );
}

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "positive" | "warning" | "negative" | "neutral";
}) {
  const tones = {
    positive: "border-emerald-600/50 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-600/50 bg-amber-500/10 text-amber-300",
    negative: "border-red-700/50 bg-red-500/10 text-red-300",
    neutral: "border bg-surface-soft text-muted",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}

export function MemberLevelBadge({ level }: { level: MemberLevel | null | undefined }) {
  if (!level) return null;
  if (level === "tutor") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-gold/60 bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
        <Star className="h-3 w-3 fill-gold" aria-hidden />
        {MEMBER_LEVEL_LABELS.tutor}
      </span>
    );
  }
  if (level === "regular_member") {
    return (
      <span className="inline-flex items-center rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-soft">
        {MEMBER_LEVEL_LABELS.regular_member}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border bg-surface-soft px-2 py-0.5 text-xs text-muted">
      {MEMBER_LEVEL_LABELS.new_member}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-surface p-5", className)}>{children}</div>
  );
}

export function EmptyRow({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed bg-surface px-4 py-10 text-center text-sm text-muted">
      {message}
    </p>
  );
}
