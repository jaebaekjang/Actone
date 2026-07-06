import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

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
        <p className="t-label">House Promise</p>
        <h2 className="t-display mt-3 text-xl text-foreground md:text-2xl">
          안전한 대기실을 지키는 약속
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          액트원은 배우들이 안심하고 이야기할 수 있는 공간을 지키기 위해 명확한
          수칙을 둡니다.
        </p>

        <ul className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RULES.map((rule) => (
            <li
              key={rule}
              className="rounded-lg border bg-surface px-4 py-3 text-sm text-foreground"
            >
              <span className="mr-2 text-accent" aria-hidden>
                ·
              </span>
              {rule}
            </li>
          ))}
        </ul>

        <Link href="/guidelines" className={buttonStyles("secondary", "md", "mt-7")}>
          커뮤니티 이용수칙 전체 보기
        </Link>
      </div>
    </section>
  );
}
