import Link from "next/link";
import {
  CATEGORY_SLUGS,
  formatDateTime,
  POST_STATUS_LABELS,
  type Post,
} from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { EmptyRow, PageHeader, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { setPostPinned, setPostStatus } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function NoticesAdminPage() {
  const { supabase } = await requireAdmin();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", CATEGORY_SLUGS.notices)
    .maybeSingle();

  const { data } = category
    ? await supabase
        .from("posts")
        .select("*")
        .eq("category_id", category.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };
  const notices = (data as Post[] | null) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="공지 관리"
        description="공지는 커뮤니티 홈 상단에 표시됩니다. 고정 공지가 먼저 노출됩니다."
        action={
          <Link
            href="/notices/new"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover"
          >
            공지 작성
          </Link>
        }
      />

      <div className="space-y-2">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div
              key={notice.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <StatusBadge
                    label={POST_STATUS_LABELS[notice.status] ?? notice.status}
                    tone={
                      notice.status === "published"
                        ? "positive"
                        : notice.status === "hidden"
                          ? "warning"
                          : "negative"
                    }
                  />
                  {notice.is_pinned ? <StatusBadge label="고정" tone="warning" /> : null}
                  <span>{formatDateTime(notice.created_at)}</span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {notice.title}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <Link
                  href={`/notices/${notice.id}`}
                  className="inline-flex h-8 items-center rounded-lg border bg-surface-soft px-3 text-xs text-foreground hover:bg-surface-soft/70"
                >
                  수정
                </Link>
                <ConfirmButton action={setPostPinned.bind(null, notice.id, !notice.is_pinned)}>
                  {notice.is_pinned ? "고정 해제" : "고정"}
                </ConfirmButton>
                {notice.status === "published" ? (
                  <ConfirmButton action={setPostStatus.bind(null, notice.id, "hidden")}>
                    숨김
                  </ConfirmButton>
                ) : (
                  <ConfirmButton
                    action={setPostStatus.bind(null, notice.id, "published")}
                    tone="positive"
                  >
                    게시
                  </ConfirmButton>
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyRow message="공지가 없습니다." />
        )}
      </div>
    </div>
  );
}
