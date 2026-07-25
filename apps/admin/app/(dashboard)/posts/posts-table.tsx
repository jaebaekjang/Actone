"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateTime, POST_STATUS_LABELS, siteConfig } from "@actone/shared";
import { ConfirmButton } from "@/components/confirm-button";
import { StatusBadge } from "@/components/ui";
import { bulkSetPostStatus, movePost, setPostPinned, setPostStatus } from "@/lib/actions";

interface Row {
  id: string;
  title: string;
  status: "published" | "hidden" | "deleted";
  is_pinned: boolean;
  category_id: string;
  created_at: string;
}

export function PostsTable({
  posts,
  categories,
}: {
  posts: Row[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  const allSelected = posts.length > 0 && selected.size === posts.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(posts.map((p) => p.id)));
  }
  function runBulk(status: "published" | "hidden" | "deleted", label: string) {
    if (selected.size === 0) return;
    if (!window.confirm(`선택한 ${selected.size}건을 ${label} 처리할까요?`)) return;
    startTransition(async () => {
      await bulkSetPostStatus([...selected], status);
      setSelected(new Set());
      router.refresh();
    });
  }
  function onMove(postId: string, categoryId: string, current: string) {
    if (categoryId === current) return;
    if (!window.confirm(`이 게시글을 "${catName.get(categoryId)}"(으)로 이동할까요?`)) {
      router.refresh();
      return;
    }
    startTransition(async () => {
      await movePost(postId, categoryId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-surface-soft px-3 py-2 text-sm">
          <span className="text-muted">{selected.size}건 선택</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("hidden", "숨김")}
            className="h-8 rounded-lg border bg-surface px-3 text-xs text-foreground hover:bg-surface-soft disabled:opacity-50"
          >
            일괄 숨김
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("published", "복구")}
            className="h-8 rounded-lg border border-emerald-700/60 bg-emerald-950/40 px-3 text-xs text-emerald-300 hover:bg-emerald-950/70 disabled:opacity-50"
          >
            일괄 복구
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => runBulk("deleted", "삭제")}
            className="h-8 rounded-lg border border-red-800/60 bg-red-950/40 px-3 text-xs text-red-300 hover:bg-red-950/70 disabled:opacity-50"
          >
            일괄 삭제
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b bg-surface text-left text-xs text-muted">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-[#f97316]"
                  aria-label="전체 선택"
                />
              </th>
              <th className="px-3 py-3 font-medium">제목</th>
              <th className="px-3 py-3 font-medium">게시판</th>
              <th className="px-3 py-3 font-medium">상태</th>
              <th className="px-3 py-3 font-medium">작성일</th>
              <th className="px-3 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b bg-background last:border-b-0 hover:bg-surface">
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(post.id)}
                    onChange={() => toggle(post.id)}
                    className="h-4 w-4 accent-[#f97316]"
                    aria-label="선택"
                  />
                </td>
                <td className="max-w-[280px] px-3 py-2.5">
                  <a
                    href={`${siteConfig.url}/posts/${post.id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block truncate font-medium text-foreground hover:text-accent-soft"
                  >
                    {post.is_pinned ? "📌 " : ""}
                    {post.title}
                  </a>
                </td>
                <td className="px-3 py-2.5">
                  <select
                    defaultValue={post.category_id}
                    disabled={pending}
                    onChange={(e) => onMove(post.id, e.target.value, post.category_id)}
                    className="h-8 rounded-lg border bg-surface px-2 text-xs text-foreground focus:border-accent focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge
                    label={POST_STATUS_LABELS[post.status] ?? post.status}
                    tone={
                      post.status === "published"
                        ? "positive"
                        : post.status === "hidden"
                          ? "warning"
                          : "negative"
                    }
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted">
                  {formatDateTime(post.created_at)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {post.status !== "published" ? (
                      <ConfirmButton
                        action={setPostStatus.bind(null, post.id, "published")}
                        tone="positive"
                      >
                        복구
                      </ConfirmButton>
                    ) : null}
                    {post.status !== "hidden" ? (
                      <ConfirmButton action={setPostStatus.bind(null, post.id, "hidden")}>
                        숨김
                      </ConfirmButton>
                    ) : null}
                    {post.status !== "deleted" ? (
                      <ConfirmButton
                        action={setPostStatus.bind(null, post.id, "deleted")}
                        tone="danger"
                        confirmMessage="이 글을 삭제 처리할까요?"
                      >
                        삭제
                      </ConfirmButton>
                    ) : null}
                    <ConfirmButton action={setPostPinned.bind(null, post.id, !post.is_pinned)}>
                      {post.is_pinned ? "고정 해제" : "고정"}
                    </ConfirmButton>
                    <Link
                      href={`/posts/${post.id}`}
                      className="inline-flex h-8 items-center rounded-lg border bg-surface-soft px-3 text-xs text-foreground hover:bg-surface-soft/70"
                    >
                      내용
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
