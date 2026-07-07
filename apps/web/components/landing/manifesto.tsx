import { SectionHeader } from "./section-header";

const DECLARATIONS = [
  { stamp: "NO CASTING BROKERAGE", text: "캐스팅 중개나 소속사 매칭을 하지 않습니다." },
  { stamp: "NO ACTOR DATABASE", text: "배우 데이터베이스를 만들어 검색하게 하지 않습니다." },
  { stamp: "NO PAID CLASS FUNNEL", text: "유료 구독이나 강의를 팔지 않습니다." },
  { stamp: "NO ANONYMOUS ATTACKS", text: "익명 뒤에 숨은 비방을 허용하지 않습니다." },
];

export function ActOneManifesto() {
  return (
    <section className="border-b bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <SectionHeader
          eyebrow="무대 뒤 약속"
          strong="액트원이 하지 않는 것"
          sub="무대 뒤 벽에 붙여둔 약속입니다. 이 네 가지는 앞으로도 하지 않습니다."
        />

        <div className="ticket-card mt-7 rounded-xl p-1.5 md:p-2" style={{ "--notch-bg": "var(--color-surface)" } as React.CSSProperties}>
          <ul className="divide-y divide-dashed divide-[rgba(232,221,199,0.22)]">
            {DECLARATIONS.map((declaration, index) => (
              <li
                key={declaration.stamp}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5"
              >
                <p className="font-medium leading-relaxed text-foreground">
                  <span className="mr-3 font-mono text-xs text-dim">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {declaration.text}
                </p>
                <span className="shrink-0 rounded border border-dim/50 px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-dim sm:-rotate-1">
                  {declaration.stamp}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
