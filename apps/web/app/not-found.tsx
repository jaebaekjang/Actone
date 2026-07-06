import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-4xl font-bold text-foreground">404</p>
      <p className="text-muted">페이지를 찾을 수 없거나 삭제된 글입니다.</p>
      <Link
        href="/community"
        className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
      >
        커뮤니티 홈으로
      </Link>
    </div>
  );
}
