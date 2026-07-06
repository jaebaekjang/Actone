import { Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { NoticeForm } from "../notice-form";

export const dynamic = "force-dynamic";

export default async function NewNoticePage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="공지 작성" />
      <Card>
        <NoticeForm postId={null} />
      </Card>
    </div>
  );
}
