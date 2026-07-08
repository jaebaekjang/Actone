import { cn } from "@actone/shared";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldStyles =
  "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none disabled:opacity-50";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
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
  className,
  children,
  htmlFor,
}: {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-medium text-foreground", className)}>
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger-soft">{message}</p>;
}
