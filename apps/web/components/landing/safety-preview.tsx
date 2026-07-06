import { SectionHeader } from "./section-header";

const RULES = [
  "실명 저격 금지",
  "허위 오디션 정보 금지",
  "개인정보 노출 금지",
  "성희롱·혐오 발언 금지",
  "신상 털기 금지",
  "반복 위반 시 이용 제한",
];

export function SafetyPreview() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <SectionHeader
          eyebrow="이용 수칙"
          strong="안전한 대기실을 지키는 약속"
          sub="액트원은 배우들이 안심하고 이야기할 수 있는 공간을 지키기 위해 명확한 수칙을 둡니다."
          href="/guidelines"
          linkLabel="이용수칙 전체 보기"
        />

        <ul className="mt-10 border-t border-foreground/12">
          {RULES.map((rule, index) => (
            <li
              key={rule}
              data-reveal
              className="flex items-center gap-4 border-b border-foreground/12 py-5 md:gap-8 md:py-6"
            >
              <span className="text-sm font-bold text-festival [font-variant-numeric:tabular-nums]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-lg font-semibold text-foreground md:text-xl">
                {rule}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
