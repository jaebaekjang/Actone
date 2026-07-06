import { SectionHeader } from "./section-header";

const SHARE_ITEMS = [
  {
    title: "오디션 정보",
    desc: "단편, 독립영화, 연극, 웹드라마 지원 정보를 나눕니다.",
    tags: ["단편영화", "마감일", "출처링크"],
  },
  {
    title: "현장 후기",
    desc: "오디션과 촬영장에서 겪은 진짜 경험을 공유합니다.",
    tags: ["촬영후기", "오디션후기", "조심할점"],
  },
  {
    title: "스터디",
    desc: "대본 리딩, 독백, 카메라 연기를 함께 연습합니다.",
    tags: ["대본리딩", "독백", "카메라연기"],
  },
  {
    title: "오프라인 모임",
    desc: "같은 길을 걷는 배우들을 직접 만나 연결됩니다.",
    tags: ["서울", "네트워킹", "번개"],
  },
  {
    title: "배우 생존 이야기",
    desc: "불안, 생계, 슬럼프까지 혼자 삼키지 않아도 됩니다.",
    tags: ["멘탈", "생계", "다시시작"],
  },
];

export function ShareCategories() {
  return (
    <section className="border-b bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <SectionHeader eyebrow="함께 나누는 것" strong="이곳에서 나눌 수 있는 것" />

        <ul className="mt-10 border-t border-foreground/12">
          {SHARE_ITEMS.map((item, index) => (
            <li
              key={item.title}
              data-reveal
              className="group grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2 border-b border-foreground/12 py-7 transition-colors hover:bg-foreground/[0.02] md:grid-cols-[5rem_1fr_auto] md:gap-x-8 md:py-9"
            >
              <span className="text-sm font-bold text-festival [font-variant-numeric:tabular-nums]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="col-start-2">
                <h3 className="t-display text-[clamp(1.6rem,4.2vw,2.75rem)] leading-none text-foreground transition-colors group-hover:text-accent-soft">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:hidden">
                  {item.desc}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-foreground/8 px-2.5 py-0.5 text-[11px] text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="col-start-2 hidden max-w-xs text-sm leading-relaxed text-muted md:col-start-3 md:block md:text-right">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
