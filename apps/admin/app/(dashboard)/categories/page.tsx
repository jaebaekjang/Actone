import type { Category } from "@actone/shared";
import { Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { CategoryRowForm } from "./category-row-form";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  const categories = (data as Category[] | null) ?? [];

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="카테고리 관리"
        description="이름, 설명, 정렬 순서, 활성 여부를 수정할 수 있습니다. slug는 시스템 동작(자료실/공지/오프라인 모임 규칙)에 사용되므로 변경할 수 없습니다."
      />

      <div className="space-y-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <p className="text-xs text-muted">slug: {category.slug}</p>
            <div className="mt-2">
              <CategoryRowForm category={category} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
