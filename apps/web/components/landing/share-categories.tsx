const SHARE_ITEMS = [
  {
    label: "CALL SHEET",
    title: "오디션 정보",
    desc: "단편, 독립영화, 연극, 웹드라마 지원 정보를 나눕니다.",
  },
  {
    label: "FIELD NOTE",
    title: "현장 후기",
    desc: "오디션과 촬영장에서 겪은 진짜 경험을 공유합니다.",
  },
  {
    label: "REHEARSAL",
    title: "스터디",
    desc: "대본 리딩, 독백, 카메라 연기를 함께 연습합니다.",
  },
  {
    label: "MEETUP",
    title: "오프라인 모임",
    desc: "같은 길을 걷는 배우들을 직접 만나 연결됩니다.",
  },
  {
    label: "GREEN ROOM",
    title: "배우 생존 이야기",
    desc: "불안, 생계, 슬럼프까지 혼자 삼키지 않아도 됩니다.",
  },
];

export function ShareCategories() {
  return (
    <section className="border-b bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <p className="t-label">Act 03 · What We Share</p>
        <h2 className="t-display mt-3 text-xl text-foreground md:text-2xl">
          이곳에서 나눌 수 있는 것
        </h2>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHARE_ITEMS.map((item) => (
            <div key={item.title} className="pinned-note rounded-lg border bg-background p-5">
              <div className="flex items-baseline justify-between gap-2 border-b border-dashed pb-2.5">
                <span className="t-label-dim">{item.label}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent/70" aria-hidden />
              </div>
              <p className="mt-3 font-bold text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
