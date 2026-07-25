import type { Category } from "@actone/shared";
import { PageHeader } from "@/components/ui";
import { requirePermission } from "@/lib/admin";
import { CategoryRowForm } from "./category-row-form";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const { supabase } = await requirePermission("community.manage");

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  const categories = (data as Category[] | null) ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="게시판 관리"
        description="이름·소개·정렬, 열람/글쓰기/댓글 등급, 승인·익명·이미지·태그 설정을 관리합니다. slug는 시스템 동작(자료실/공지/오프라인 모임 규칙)에 사용되므로 변경할 수 없습니다."
      />

      <div className="divide-y rounded-xl border">
        {categories.map((category) => (
          <section key={category.id} className="px-4 py-5 sm:px-6">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-semibold text-foreground">
                {category.icon ? `${category.icon} ` : ""}
                {category.name}
              </h2>
              <span className="text-xs text-muted">slug: {category.slug}</span>
            </div>
            <CategoryRowForm category={category} />
          </section>
        ))}
      </div>
    </div>
  );
}
