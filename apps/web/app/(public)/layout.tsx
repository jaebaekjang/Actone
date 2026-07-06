import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { KakaoChannelButton } from "@/components/kakao-channel-button";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <KakaoChannelButton />
    </div>
  );
}
