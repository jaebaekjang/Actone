export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border-b px-6 py-16 text-center">
      <span className="mb-1 h-px w-8 bg-line" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
