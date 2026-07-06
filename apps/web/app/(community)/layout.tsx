import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KakaoChannelButton } from "@/components/kakao-channel-button";
import { MobileNav } from "@/components/mobile-nav";
import { getUserAndProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CommunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getUserAndProfile();
  if (!user) redirect("/login");
  if (!profile?.onboarding_completed) redirect("/onboarding");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {profile.is_suspended ? (
        <div className="border-b border-red-900 bg-red-950/60 px-4 py-2.5 text-center text-sm text-red-200">
          현재 계정이 일시 정지 상태입니다. 글 작성, 댓글, 좋아요 등 일부 기능이 제한됩니다.
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:pb-10">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <KakaoChannelButton />
    </div>
  );
}
