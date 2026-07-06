import { notFound } from "next/navigation";
import type { Post } from "@actone/shared";
import { Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { NoticeForm } from "../notice-form";

export const dynamic = "force-dynamic";

export default async function EditNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  const notice = data as Post | null;
  if (!notice) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="공지 수정" />
      <Card>
        <NoticeForm
          postId={notice.id}
          defaults={{
            title: notice.title,
            content: notice.content,
            is_pinned: notice.is_pinned,
          }}
        />
      </Card>
    </div>
  );
}
