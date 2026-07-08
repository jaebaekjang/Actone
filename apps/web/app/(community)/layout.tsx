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
        <div className="border-b border-danger/40 bg-danger/10 px-4 py-2.5 text-center text-sm text-danger-soft">
          현재 계정이 일시 정지 상태입니다. 글 작성, 댓글, 좋아요 등 일부 기능이 제한됩니다.
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-8 pb-24 md:px-8 md:pb-12 lg:px-10">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <KakaoChannelButton />
    </div>
  );
}
