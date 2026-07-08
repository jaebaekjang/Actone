import { TriangleAlert } from "lucide-react";

export function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 border-l-2 border-warning bg-warning/8 px-4 py-3 text-sm leading-relaxed text-warning-soft">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
