import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserAndProfile } from "@/lib/data";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "온보딩" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (profile?.onboarding_completed) redirect("/community");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">거의 다 왔어요</h1>
      <p className="mt-2 leading-relaxed text-muted">
        커뮤니티에서 사용할 프로필을 알려주세요.
        <br />
        모든 정보는 나중에 수정할 수 있습니다.
      </p>
      <div className="mt-8">
        <OnboardingForm />
      </div>
    </div>
  );
}
