import Link from "next/link";
import { Download } from "lucide-react";
import {
  formatDate,
  MEMBER_LEVEL_LABELS,
  MEMBER_LEVELS,
  ROLE_LABELS,
  type Profile,
} from "@actone/shared";
import { EmptyRow, MemberLevelBadge, PageHeader, StatusBadge } from "@/components/ui";
import { requirePermission } from "@/lib/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string; status?: string; page?: string }>;
}) {
  const { q, level, status, page } = await searchParams;
  const { supabase, can } = await requirePermission("members.view");

  const pageNum = Math.max(1, Number(page) || 1);
  const from = (pageNum - 1) * PAGE_SIZE;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (q?.trim()) {
    const term = q.trim().replaceAll(",", " ").replaceAll("%", "");
    query = query.or(`nickname.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (level && MEMBER_LEVELS.includes(level as (typeof MEMBER_LEVELS)[number])) {
    query = query.eq("member_level", level);
  }
  if (status === "suspended") query = query.eq("is_suspended", true);
  if (status === "active") query = query.eq("is_suspended", false);

  const { data, count } = await query;
  const members = (data as Profile[] | null) ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (level) exportQuery.set("level", level);
  if (status) exportQuery.set("status", status);
  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (level) sp.set("level", level);
    if (status) sp.set("status", status);
    sp.set("page", String(p));
    return `/members?${sp.toString()}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="회원 관리"
        description={`총 ${total.toLocaleString()}명`}
        action={
          can("members.export") ? (
            <a
              href={`/members/export?${exportQuery.toString()}`}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-surface-soft px-3 py-2 text-sm text-foreground hover:bg-surface-soft/70"
            >
              <Download className="h-4 w-4" aria-hidden />
              CSV 내보내기
            </a>
          ) : undefined
        }
      />

      <form className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="닉네임 / 이메일 검색"
          className="h-10 w-full max-w-xs rounded-lg border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />
        <select
          name="level"
          defaultValue={level ?? ""}
          className="h-10 rounded-lg border bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">전체 등급</option>
          {MEMBER_LEVELS.map((l) => (
            <option key={l} value={l}>
              {MEMBER_LEVEL_LABELS[l]}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-lg border bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          <option value="">전체 상태</option>
          <option value="active">정상</option>
          <option value="suspended">정지</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg border bg-surface-soft px-4 text-sm text-foreground hover:bg-surface-soft/70"
        >
          검색
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-surface text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">닉네임</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">역할</th>
              <th className="px-4 py-3 font-medium">등급</th>
              <th className="px-4 py-3 font-medium">경고</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b bg-background last:border-b-0 hover:bg-surface"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/members/${member.id}`}
                    className="font-medium text-foreground hover:text-accent-soft"
                  >
                    {member.nickname ?? "(온보딩 미완료)"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{member.email ?? "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={ROLE_LABELS[member.role] ?? member.role}
                    tone={member.role === "admin" ? "warning" : "neutral"}
                  />
                </td>
                <td className="px-4 py-3">
                  <MemberLevelBadge level={member.member_level} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {member.warning_count > 0 ? `${member.warning_count}회` : "-"}
                </td>
                <td className="px-4 py-3">
                  {member.is_suspended ? (
                    <StatusBadge label="정지" tone="negative" />
                  ) : (
                    <StatusBadge label="정상" tone="positive" />
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(member.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 ? <EmptyRow message="검색 결과가 없습니다." /> : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2 text-sm">
          {pageNum > 1 ? (
            <Link
              href={pageHref(pageNum - 1)}
              className="rounded-lg border bg-surface px-3 py-1.5 text-foreground hover:bg-surface-soft"
            >
              이전
            </Link>
          ) : null}
          <span className="text-muted">
            {pageNum} / {totalPages}
          </span>
          {pageNum < totalPages ? (
            <Link
              href={pageHref(pageNum + 1)}
              className="rounded-lg border bg-surface px-3 py-1.5 text-foreground hover:bg-surface-soft"
            >
              다음
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
