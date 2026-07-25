import {
  ADMIN_ACTIVITY_ACTION_LABELS,
  formatDateTime,
  type AdminActivityLog,
} from "@actone/shared";
import { EmptyRow, PageHeader } from "@/components/ui";
import { requirePermission } from "@/lib/admin";

export const dynamic = "force-dynamic";

const ACTION_FILTERS = Object.entries(ADMIN_ACTIVITY_ACTION_LABELS);

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const { action } = await searchParams;
  const { supabase } = await requirePermission("system.logs");

  let query = supabase
    .from("admin_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (action) query = query.eq("action", action);

  const { data } = await query;
  const logs = (data as AdminActivityLog[] | null) ?? [];

  // resolve admin display names in one round-trip
  const adminIds = [...new Set(logs.map((l) => l.admin_id).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (adminIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname, email")
      .in("id", adminIds);
    for (const p of (profiles as { id: string; nickname: string | null; email: string | null }[] | null) ??
      []) {
      names.set(p.id, p.nickname ?? p.email ?? p.id.slice(0, 8));
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="관리자 활동 로그"
        description="회원·게시글·신고·설정 등 주요 변경 이력을 기록합니다. (최근 200건)"
      />

      <form className="flex flex-wrap items-center gap-2">
        <select
          name="action"
          defaultValue={action ?? ""}
          className="h-9 rounded-lg border bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">전체 액션</option>
          {ACTION_FILTERS.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-lg border bg-surface-soft px-3 text-sm text-foreground hover:bg-surface-soft/70"
        >
          적용
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-surface text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">일시</th>
              <th className="px-4 py-3 font-medium">관리자</th>
              <th className="px-4 py-3 font-medium">액션</th>
              <th className="px-4 py-3 font-medium">대상</th>
              <th className="px-4 py-3 font-medium">요약</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b bg-background last:border-b-0">
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDateTime(log.created_at)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-foreground">
                  {log.admin_id ? names.get(log.admin_id) ?? "-" : "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="rounded-full border bg-surface-soft px-2 py-0.5 text-xs text-foreground">
                    {ADMIN_ACTIVITY_ACTION_LABELS[log.action] ?? log.action}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {log.target_type ? (
                    <span>
                      {log.target_type}
                      {log.target_id ? (
                        <span className="text-muted/60"> #{log.target_id.slice(0, 8)}</span>
                      ) : null}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="max-w-[280px] truncate px-4 py-3 text-muted">
                  {log.summary ?? "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted/70">{log.ip ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 ? <EmptyRow message="활동 로그가 없습니다." /> : null}
      </div>
    </div>
  );
}
