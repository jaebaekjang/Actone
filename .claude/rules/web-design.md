---
paths:
  - "apps/web/**/*.{ts,tsx,css}"
  - "packages/shared/**/*.{ts,tsx,css}"
---

# 사용자 사이트 디자인 규칙

- `ACTONE_DESIGN_SYSTEM.md`와 `ACTONE_PAGE_SPECS.md`를 따른다.
- 기본 shadcn 외형을 그대로 두지 않는다. 토큰 기반 커스텀 컴포넌트만 사용.
- 메인 랜딩 첫 화면은 빈 무대 스포트라이트 히어로(`.stage*` CSS 레이어)를 유지한다.
  사람/실루엣/네온/3D/AI 스톡 이미지 금지.
- 게시판은 카드 그리드가 아니라 괘선으로 구분된 행(list-first)으로 만든다.
- 단일 액센트(#E8662A)만 사용. 보라/파랑 그라디언트, 글래스모피즘, 과한 그림자 금지.
- 한국어 본문 line-height 1.65–1.8, 제목 word-break: keep-all, 본문 폭 680–760px.
- 모바일(390px) 우선. 가로 오버플로 금지. 터치 타깃 44px 내외.
- 모션은 140–200ms, opacity/color/작은 translate만. reduced-motion 존중.
