const STATS = [
  { value: "8", suffix: "개", label: "배우들의 방" },
  { value: "0", suffix: "건", label: "캐스팅 중개" },
  { value: "0", suffix: "원", label: "구독·강의 판매" },
  { value: "0", suffix: "명", label: "배우 DB 등록" },
];

/** giant-number band — what Act One is (8 rooms) and deliberately isn't (all zeros) */
export function StatsBand() {
  return (
    <section className="border-b">
      <div
        className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-12 px-4 py-16 md:grid-cols-4 md:py-24"
        data-reveal
      >
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-[clamp(3.5rem,7vw,5.5rem)] font-extrabold leading-none tracking-tight text-foreground [font-variant-numeric:tabular-nums]">
              {stat.value}
              <span className="ml-1 align-baseline text-lg font-bold text-muted">
                {stat.suffix}
              </span>
            </p>
            <p className="mt-3 border-t border-foreground/15 pt-3 text-sm font-semibold text-muted">
              {stat.label}
            </p>
          </div>
        ))}
        <p className="col-span-2 -mt-4 text-sm leading-relaxed text-dim md:col-span-4">
          액트원이 하는 일은 하나, 배우들이 모이는 것. 나머지 숫자는 앞으로도
          0에서 움직이지 않습니다.
        </p>
      </div>
    </section>
  );
}
