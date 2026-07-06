import { SectionHeader } from "./section-header";

const SHARE_ITEMS = [
  {
    title: "오디션 정보",
    desc: "단편, 독립영화, 연극, 웹드라마 지원 정보를 나눕니다.",
  },
  {
    title: "현장 후기",
    desc: "오디션과 촬영장에서 겪은 진짜 경험을 공유합니다.",
  },
  {
    title: "스터디",
    desc: "대본 리딩, 독백, 카메라 연기를 함께 연습합니다.",
  },
  {
    title: "오프라인 모임",
    desc: "같은 길을 걷는 배우들을 직접 만나 연결됩니다.",
  },
  {
    title: "배우 생존 이야기",
    desc: "불안, 생계, 슬럼프까지 혼자 삼키지 않아도 됩니다.",
  },
];

export function ShareCategories() {
  return (
    <section className="border-b bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <SectionHeader
          eyebrow="함께 나누는 것"
          strong="이곳에서 나눌 수 있는 것"
        />

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHARE_ITEMS.map((item) => (
            <div key={item.title} className="pinned-note rounded-lg border bg-background p-5">
              <div className="flex items-baseline justify-between gap-2 border-b border-dashed pb-2.5">
                <p className="font-bold text-foreground">{item.title}</p>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
