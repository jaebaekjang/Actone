import Link from "next/link";
import { formatDate, ROLE_LABELS, type Profile } from "@actone/shared";
import { EmptyRow, MemberLevelBadge, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q?.trim()) {
    const term = q.trim().replaceAll(",", " ").replaceAll("%", "");
    query = query.or(`nickname.ilike.%${term}%,email.ilike.%${term}%`);
  }
  const { data } = await query;
  const members = (data as Profile[] | null) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader title="회원 관리" description="닉네임 또는 이메일로 검색할 수 있습니다." />

      <form className="max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="닉네임 / 이메일 검색"
          className="h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-surface text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">닉네임</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">역할</th>
              <th className="px-4 py-3 font-medium">등급</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b bg-background last:border-b-0 hover:bg-surface">
                <td className="px-4 py-3">
                  <Link href={`/members/${member.id}`} className="font-medium text-foreground hover:text-accent-soft">
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
    </div>
  );
}
