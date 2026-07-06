import { TriangleAlert } from "lucide-react";

export function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
