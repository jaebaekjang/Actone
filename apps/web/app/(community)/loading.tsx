/** 커뮤니티 공통 로딩 스켈레톤 — 행 기반 목록의 뼈대를 그대로 따른다. */
export default function Loading() {
  return (
    <div
      className="mx-auto max-w-[860px] animate-pulse"
      role="status"
      aria-label="불러오는 중"
    >
      <div className="h-7 w-40 bg-surface-soft" />
      <div className="mt-3 h-4 w-72 max-w-full bg-surface" />
      <div className="mt-8 border-t">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2.5 border-b py-4">
            <div className="h-3 w-16 bg-surface" />
            <div className="h-5 w-3/4 bg-surface-soft" />
            <div className="h-4 w-1/2 bg-surface" />
            <div className="flex justify-between pt-1">
              <div className="h-3 w-24 bg-surface" />
              <div className="h-3 w-32 bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">불러오는 중</span>
    </div>
  );
}
