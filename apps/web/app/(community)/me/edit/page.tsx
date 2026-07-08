import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/data";
import { ProfileEditForm } from "./profile-edit-form";

export const metadata: Metadata = { title: "프로필 수정" };
export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const { user, profile } = await getUserAndProfile();
  if (!user || !profile) redirect("/login");

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-[24px] font-semibold tracking-tight text-foreground">프로필 수정</h1>
      <p className="mt-2 text-sm text-muted">
        닉네임, 상태, 활동 분야, 지역, 소개, 프로필 사진을 수정할 수 있습니다.
      </p>
      <div className="mt-6">
        <ProfileEditForm
          userId={user.id}
          defaults={{
            nickname: profile.nickname ?? "",
            actor_status: profile.actor_status ?? "",
            activity_field: profile.activity_field ?? "",
            region: profile.region ?? "",
            bio: profile.bio ?? "",
            avatar_url: profile.avatar_url ?? "",
          }}
        />
      </div>
    </div>
  );
}
