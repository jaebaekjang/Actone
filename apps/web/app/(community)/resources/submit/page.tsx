import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { CATEGORY_SLUGS, RESOURCE_SUBMITTED_MESSAGE } from "@actone/shared";
import { buttonStyles } from "@/components/ui/button";
import { getUserAndProfile } from "@/lib/data";
import { ResourceSubmitForm } from "./resource-submit-form";

export const metadata: Metadata = { title: "자료 제보하기" };
export const dynamic = "force-dynamic";

export default async function ResourceSubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;
  const { profile } = await getUserAndProfile();

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-accent" aria-hidden />
        <h1 className="mt-4 text-xl font-bold text-foreground">제보 완료</h1>
        <p className="mt-3 leading-relaxed text-muted">{RESOURCE_SUBMITTED_MESSAGE}</p>
        <Link
          href={`/community/${CATEGORY_SLUGS.resources}`}
          className={buttonStyles("secondary", "md", "mt-8")}
        >
          자료실로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-foreground">자료 제보하기</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        배우들에게 도움이 되는 자료를 제보해주세요. 관리자가 확인 후 자료실에
        게시합니다. 회원이 직접 자료실에 글을 올릴 수는 없습니다.
      </p>
      {profile?.is_suspended ? (
        <p className="mt-6 rounded-xl border bg-surface px-4 py-8 text-center text-sm text-muted">
          현재 계정 상태에서는 자료를 제보할 수 없습니다.
        </p>
      ) : (
        <div className="mt-6">
          <ResourceSubmitForm />
        </div>
      )}
    </div>
  );
}
