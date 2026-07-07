import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ADMIN_ONLY_CATEGORY_SLUGS,
  CATEGORY_SLUGS,
  type OfflineMeetupDetails,
  type Post,
  type PostImage,
} from "@actone/shared";
import { PostForm } from "@/components/post-form";
import { updatePost } from "@/lib/actions/posts";
import { getActiveCategories, getUserAndProfile } from "@/lib/data";

export const metadata: Metadata = { title: "글 수정" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const { supabase, user } = await getUserAndProfile();
  if (!user) redirect("/login");

  const { data: rawPost } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();
  const post = rawPost as Post | null;
  if (!post || post.status === "deleted") notFound();
  if (post.author_id !== user.id) redirect(`/posts/${postId}`);

  const categories = (await getActiveCategories()).filter(
    (c) => !ADMIN_ONLY_CATEGORY_SLUGS.includes(c.slug),
  );
  const category = categories.find((c) => c.id === post.category_id);

  let meetupDefaults: OfflineMeetupDetails | null = null;
  if (category?.slug === CATEGORY_SLUGS.offlineMeetups) {
    // authors may read their own meetup row (incl. the URL they set)
    const { data } = await supabase
      .from("offline_meetup_details")
      .select("*")
      .eq("post_id", postId)
      .maybeSingle();
    meetupDefaults = (data as OfflineMeetupDetails | null) ?? null;
  }

  const { data: imagesData } = await supabase
    .from("post_images")
    .select("*")
    .eq("post_id", postId)
    .order("sort_order");
  const imageDefaults = ((imagesData as PostImage[] | null) ?? []).map(
    (i) => i.image_url,
  );

  const boundUpdate = updatePost.bind(null, postId);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-foreground">글 수정</h1>
      <div className="mt-6">
        <PostForm
          mode="edit"
          categories={categories}
          action={boundUpdate}
          userId={user.id}
          imageDefaults={imageDefaults}
          defaultValues={{
            category_id: post.category_id,
            title: post.title,
            content: post.content,
            tags: post.tags.join(", "),
          }}
          meetupDefaults={meetupDefaults}
        />
      </div>
    </div>
  );
}
