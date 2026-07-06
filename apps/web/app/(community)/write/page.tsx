import type { Metadata } from "next";
import { ADMIN_ONLY_CATEGORY_SLUGS } from "@actone/shared";
import { PostForm } from "@/components/post-form";
import { createPost } from "@/lib/actions/posts";
import { getActiveCategories, getUserAndProfile } from "@/lib/data";

export const metadata: Metadata = { title: "글쓰기" };
export const dynamic = "force-dynamic";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const { profile } = await getUserAndProfile();
  const categories = (await getActiveCategories()).filter(
    (c) => !ADMIN_ONLY_CATEGORY_SLUGS.includes(c.slug),
  );
  const defaultCategory = categories.find((c) => c.slug === categorySlug);

  if (profile?.is_suspended) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-bold text-foreground">글쓰기</h1>
        <p className="mt-6 rounded-xl border bg-surface px-4 py-8 text-center text-sm text-muted">
          현재 계정 상태에서는 글을 작성할 수 없습니다.
          <br />
          자세한 내용은 관리자에게 문의해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-foreground">글쓰기</h1>
      <div className="mt-6">
        <PostForm
          mode="create"
          categories={categories}
          action={createPost}
          defaultValues={{ category_id: defaultCategory?.id ?? "" }}
        />
      </div>
    </div>
  );
}
