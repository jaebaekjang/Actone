import type { Metadata } from "next";

export const metadata: Metadata = { title: "커뮤니티 이용수칙" };

const RULES = [
  {
    title: "서로를 존중해주세요",
    desc: "우리는 모두 같은 길 위에 있습니다. 다른 회원의 상황과 선택을 존중해주세요.",
  },
  {
    title: "실명 저격을 금지합니다",
    desc: "특정 개인이나 단체를 실명으로 공격하는 글은 숨김 처리될 수 있습니다. 경험 공유는 가능하지만 개인 공격은 안 됩니다.",
  },
  {
    title: "명예훼손에 주의해주세요",
    desc: "확인되지 않은 내용을 사실처럼 쓰지 마세요. 법적 문제로 이어질 수 있습니다.",
  },
  {
    title: "개인정보를 노출하지 마세요",
    desc: "본인 또는 타인의 연락처, 주소, 신상 정보를 공개하지 마세요.",
  },
  {
    title: "허위 오디션 정보를 올리지 마세요",
    desc: "출처가 불분명하거나 사실과 다른 오디션 정보는 다른 배우에게 큰 피해가 됩니다.",
  },
  {
    title: "성희롱을 금지합니다",
    desc: "성적 수치심을 유발하는 표현과 접근은 즉시 제재 대상입니다.",
  },
  {
    title: "스팸과 반복 게시를 금지합니다",
    desc: "같은 글의 도배, 무관한 홍보, 상업적 스팸은 삭제될 수 있습니다.",
  },
  {
    title: "혐오 발언을 금지합니다",
    desc: "성별, 나이, 지역, 출신 등에 대한 혐오 표현은 허용되지 않습니다.",
  },
  {
    title: "신상 털기를 금지합니다",
    desc: "다른 회원의 신원을 추적하거나 공개하는 행위는 영구 제재 대상입니다.",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground">커뮤니티 이용수칙</h1>
      <p className="mt-3 leading-relaxed text-muted">
        액트원은 인맥 없이 시작한 배우들이 안심하고 이야기할 수 있는 공간입니다.
        이 공간을 지키기 위해 아래 수칙을 꼭 지켜주세요.
      </p>
      <ol className="mt-8 space-y-4">
        {RULES.map((rule, i) => (
          <li key={rule.title} className="rounded-xl border bg-surface p-5">
            <p className="font-semibold text-foreground">
              {i + 1}. {rule.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{rule.desc}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm leading-relaxed text-muted">
        수칙을 위반한 글과 댓글은 관리자에 의해 숨김 또는 삭제될 수 있으며,
        반복 위반 시 계정 이용이 제한될 수 있습니다.
      </p>
    </div>
  );
}
