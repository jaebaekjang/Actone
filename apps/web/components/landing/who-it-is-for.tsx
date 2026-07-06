import { SectionHeader } from "./section-header";

const VOICES = [
  "나만 이렇게 헤매는 줄 알았던 사람",
  "오디션 결과보다 다음 시도가 더 어려운 사람",
  "현장에 가기 전, 누군가의 경험이 필요했던 사람",
  "다시 시작하고 싶은데 어디서부터 해야 할지 모르겠는 사람",
];

export function WhoItIsFor() {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <SectionHeader
          eyebrow="함께하는 사람들"
          strong="이런 분들을 위한 커뮤니티"
          rest="입니다"
        />

        <div className="mt-7 grid gap-3 md:grid-cols-2">
          {VOICES.map((voice) => (
            <figure
              key={voice}
              className="pinned-note rounded-lg border-l-2 border-l-accent/60 bg-surface p-5"
            >
              <blockquote className="leading-relaxed text-foreground">
                &ldquo;{voice}&rdquo;
              </blockquote>
            </figure>
          ))}
        </div>

        <p className="mt-8 max-w-2xl leading-relaxed text-muted">
          액트원은 잘나가는 배우들을 위한 공간이 아닙니다. 경력이 부족한 사람,
          인맥이 없는 사람, 계속 떨어지고 있는 사람, 다시 시작하고 싶은 사람을
          위한 커뮤니티입니다.
        </p>
      </div>
    </section>
  );
}
