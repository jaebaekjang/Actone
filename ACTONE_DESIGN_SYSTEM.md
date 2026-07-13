# ACTONE DESIGN SYSTEM

액트원 사용자/관리자 사이트의 비주얼 시스템. 구현과 1:1로 대응한다.
토큰 소스: `apps/web/app/globals.css`, `apps/admin/app/globals.css`.

## 1. 비주얼 컨셉

**"배우들이 공연 전후에 머무는 조용한 백스테이지 라운지 + 독립 잡지의 편집 디자인."**

- 절제된 다크 극장 분위기 (사용자 사이트)
- 에디토리얼 타이포그래피: 괘선(hairline), 번호 매긴 인덱스, 비대칭 2단 구성
- 매일 읽고 쓰기 편한 정보 밀도 — 전체를 시네마틱 포스터로 만들지 않는다
- 단일 액센트 오렌지, 팬카페/AI SaaS 느낌 배제
- 관리자 사이트는 의도적으로 분리된 라이트 운영 인터페이스

## 2. 빈 무대 스포트라이트 히어로 (필수 규격)

랜딩 첫 화면의 확정 브랜드 비주얼. 구현: `apps/web/app/globals.css`의
`.stage`, `.stage-cone`, `.stage-pool`, `.stage-floor`, `.stage-grain` +
`apps/web/app/(public)/page.tsx` 히어로 섹션.

레이어 구조 (전부 CSS, 이미지 없음):

1. `.stage` — 차콜 수직 톤 시프트(#101011→#1a1817→#141312) + `::before`로
   좌우 커튼 낙차와 극히 옅은(1.2%) 수직 스트라이프(공간감).
2. `.stage-cone` — 상단 중앙에서 내려오는 단일 광선. linear-gradient(따뜻한
   호박색, 최대 알파 0.34) + `clip-path` 사다리꼴 + `blur(22px)`.
3. `.stage-pool` — 바닥의 타원형 빛 웅덩이. elliptical radial-gradient.
4. `.stage-floor` — `::before` 무대 앞 경계선(중앙만 밝은 1px), `::after`
   빛 웅덩이 안에서만 보이는 마룻바닥 세로선(radial mask).
5. `.stage-grain` — SVG feTurbulence 노이즈, opacity 0.05.

배치 규칙:

- 데스크톱: 카피는 좌측 어두운 여백(max-w-2xl, 좌측 4% 들여쓰기), 무대 빛
  웅덩이는 첫 화면 중앙 하단. CTA가 빛 웅덩이를 가리지 않는다
  (`pb-[26svh]`로 하단 확보).
- 모바일: `pb-[30svh]`로 무대 바닥과 빛의 원을 반드시 남긴다. 검은
  그라데이션으로 잘려 보이면 안 된다.
- 브랜드 무대 이미지가 나중에 제공되면 `.stage` 내부 레이어 div들을
  이미지 레이어로 교체하는 구조.

금지: 사람/실루엣, 관객, 카메라, 클래퍼보드, 마이크, 연기·안개, 네온,
3D 렌더, 호러/콘서트/클럽 분위기, AI 스톡 이미지, 과한 레드 벨벳.

최종 CTA 밴드와 로그인 페이지는 `.stage-echo`(하단 잔광)로 히어로를 조용히 반복.

## 3. 컬러 토큰

### 사용자 사이트 (다크)

| 토큰 | 값 | 용도 |
|---|---|---|
| `background` | `#111112` | 잉크 배경 (순수 검정 금지) |
| `surface` | `#181819` | 깊은 서페이스 |
| `surface-soft` | `#202022` | 올라온 서페이스, hover |
| `foreground` | `#F2F0EC` | 본문 텍스트 (순백 금지) |
| `muted` | `#AAA7A1` | 보조 텍스트 |
| `line` | `#323033` | 1px 괘선/보더 |
| `paper` / `paper-ink` / `paper-muted` / `paper-line` | `#F2EFE9` `#1A1917` `#68645E` `#D7D2C9` | 랜딩 오프라인 모임 밴드 등 라이트 에디토리얼 밴드 |
| `accent` / `accent-hover` | `#E8662A` / `#CD5120` | 유일한 액센트 |
| `accent-soft` | `#EFA079` | 다크 위 액센트 톤 텍스트 |
| `success` / `-soft` | `#39825A` / `#7DBB98` | 상태 |
| `warning` / `-soft` | `#C58427` / `#D9AB62` | 상태 |
| `danger` / `-soft` | `#B94A48` / `#DD9391` | 상태/에러 텍스트 |
| `gold` | `#CFA45E` | 튜터 배지 전용 |
| `kakao` | `#FEE500` | 카카오 버튼 전용 |

규칙: 액센트는 오렌지 하나. 보라/파랑 네온 그라디언트, 글래스모피즘,
글로우 카드 금지. 상태는 색+텍스트로 함께 전달.

### 관리자 사이트 (라이트)

| 토큰 | 값 |
|---|---|
| `background` | `#F5F4F1` |
| `surface` | `#FFFFFF` |
| `surface-soft` | `#EDEBE6` |
| `foreground` | `#1E1D1A` |
| `muted` | `#6B6862` |
| `line` | `#DDD9D1` |
| `accent` / `accent-hover` / `accent-soft` | `#D85B25` / `#B8481A` / `#B04A1C` |
| `success` / `warning` / `danger` | `#347A52` / `#9A6A1C` / `#B3413D` |
| `gold` | `#8A6A2F` (라이트 위 튜터) |

관리자는 다크 모드 없음. 시네마틱 요소 없음.

## 4. 타이포그래피

폰트: Pretendard Variable (CDN dynamic subset), 시스템 한글 폴백.

| 레벨 | 데스크톱 | 모바일 | 웨이트 |
|---|---|---|---|
| Display (히어로) | 54px | 34px | 600 |
| 페이지 타이틀 | 32–36px | 27px | 600 |
| 섹션 타이틀 | 24–28px | 22–24px | 600 |
| 글 제목(상세) | 27px | 23px | 600 |
| 리스트 행 제목 | 16–17px | 16px | 600 |
| 본문 | 15–16px | 15px | 400 |
| 메타 | 12–13px | 12px | 400–500 |

- 긴 한국어 본문 line-height 1.7–1.8 (`leading-[1.75]`, `leading-[1.8]`)
- 제목 `word-break: keep-all` (globals.css base), `tracking-tight`
- 본문 폭 720–760px (`max-w-[720px]`, `max-w-[760px]`)
- 볼드 남발 금지 — 700 이상 대신 600 + 크기/간격으로 위계
- 날짜·카운트 정렬 구간은 `.tnum`(tabular-nums)
- 장식용 영문 대문자 라벨 금지

## 5. 간격 · 보더 · 라운드 · 엘리베이션

- 4px/8px 간격 시스템 (Tailwind 스케일)
- 페이지 좌우 패딩: 모바일 `px-5`(20px) / 태블릿 `md:px-8`(32px) / 데스크톱 `lg:px-10`(40px)
- 콘텐츠 최대 폭: 랜딩 1200px, 커뮤니티 셸 1180px, 아티클 720–760px, 게시판 860px, 관리자 1440px(유동)
- 라운드: 컨트롤 `rounded-lg`(8px). 에디토리얼 요소(행, 배너, 인용, 밴드)는
  각지게(0) 두고 괘선으로 구분. 24px+ 라운드 금지
- 보더: 1px `line` 우선. 그림자는 토스트 등 오버레이에만
- 모션: 140–200ms, opacity/색/작은 translate만. 바운스·플로팅·패럴랙스 금지.
  `prefers-reduced-motion` 전역 대응 (globals.css)

## 6. 시맨틱 컴포넌트 (apps/web/components)

| 컴포넌트 | 파일 | 역할 |
|---|---|---|
| `CommunityPostRow` | `post-row.tsx` | 게시판 기본 단위. 카드가 아닌 괘선 행: 제목 + 1줄 발췌 + 작성자/배지 + tnum 카운트 |
| `FeaturedMeetup` | `featured-meetup.tsx` | 홈 상단 오프라인 모임 하이라이트 (accent 좌측 보더 모듈) |
| `CategoryIndex` / `CategoryScroller` | `category-index.tsx` | 번호 매긴 게시판 인덱스 / 모바일 가로 스크롤 |
| `CommunitySidebar` | `community-sidebar.tsx` | 홈 우측 레일: 오늘의 질문, 인기 글, 게시판, 등급 안내 |
| `MemberLevelBadge` / `AuthorLabel` | `member-level-badge.tsx` | 등급 배지. 튜터는 gold + 별로 강조, 운영진 표기 포함 |
| `Header` / `Footer` / `MobileNav` | 각 파일 | 셸. 헤더 64px, 모바일 하단 내비 4개 항목 |
| `EmptyState`, `WarningBox` | 각 파일 | 상태. WarningBox는 warning 좌측 보더 스트립 |
| `Button/Input/Select/Textarea/Toast` | `ui/` | 커스텀 베이스 (shadcn 기본 외형 아님) |

관리자: `components/ui.tsx`(Button/Input/StatusBadge/MemberLevelBadge/PageHeader/Card),
`components/nav.tsx`(콤팩트 좌측 내비), `confirm-button.tsx`.

## 7. 배지 규칙

- 형태: pill(전체 라운드) — 신원 칩이므로 시맨틱하게 허용
- 신규회원: line 보더 + muted 텍스트 (조용함)
- 정회원: accent 보더/틴트 + accent-soft 텍스트
- 튜터: gold 보더/틴트 + 별 아이콘 + semibold — 유일하게 강조되는 배지.
  플래시하지 않게, 신뢰 표시로만
- 운영진: accent 계열 "운영진" 배지
- 모든 글/댓글에 `닉네임 · 배지` 형태로 표시. 튜터 글 자동 고정 금지

## 8. 반응형 동작

- 390px: 단일 컬럼, 하단 고정 내비(홈/검색/글쓰기/마이), 카테고리 가로 스크롤러, 가로 오버플로 금지
- 768px: 랜딩 2단 시작, 커뮤니티는 아직 단일 컬럼 중심
- 1024px+(lg): 커뮤니티 홈 = 메인 피드 + 300px 우측 레일(sticky), 데스크톱 헤더에 글쓰기/검색
- 관리자: lg 미만 상단 가로 내비, lg 이상 224px 좌측 내비 + 밀도 있는 테이블

## 9. 금지 패턴 (AI 생성 룩 제거)

- 기본 shadcn 샘플 외형, 보라/파랑 네온 그라디언트, 히어로 블러 블롭
- 글래스모피즘, 글로우 카드, 24–32px 라운드 남발, 모든 섹션의 카드화
- 동일한 3열 기능 카드 그리드 반복, 아이콘-제목-설명 카드
- 필 라벨 남발, 내용 없는 거대 중앙 히어로, AI 스톡 일러스트
- 가짜 후기/아바타/회원 수/파트너 로고/보도 (콘텐츠 리얼리즘 — seed 실데이터만)
- 장식용 차트, 반짝이/로켓/마법봉 아이콘, 내비·헤딩의 이모지
- 순수 #000 배경 + 순백 텍스트, lorem ipsum, 빈 플레이스홀더 카드 반복
- 모바일을 그대로 늘린 데스크톱, 관리자에 다크 마케팅 스타일
- "당신의 가능성을 펼쳐보세요" 류의 공허한 마이크로카피

## 10. 접근성

- 본문/보조 텍스트 대비 AA 이상 (#F2F0EC·#AAA7A1 on #111112, #1E1D1A·#6B6862 on #F5F4F1)
- 전역 `:focus-visible` 2px accent 아웃라인
- 모든 폼 컨트롤에 Label, 아이콘 버튼에 aria-label
- 상태를 색으로만 전달하지 않음 (배지 텍스트 병기)
- 터치 타깃 44px 내외 (버튼 h-10~h-12, 내비 py-2.5)
- `prefers-reduced-motion` 전역 대응
- 푸터 사업자 주소 등 긴 한국어 줄바꿈 확인 (max-w + overflow-wrap)
