# ACTONE PAGE SPECS

주요 페이지별 목적/정보 위계/레이아웃/상태. 컴포넌트 명칭은 `ACTONE_DESIGN_SYSTEM.md` §6 참조.
공통: 로딩은 `(community)/loading.tsx` 스피너, 에러 텍스트는 `danger-soft`, 빈 상태는 `EmptyState`.

## / (랜딩) — apps/web/app/(public)/page.tsx

- 목적: 첫 방문자가 "빈 무대 스포트라이트"를 인식하고, 바로 아래에서 실제 커뮤니티
  활동(오프라인 모임)을 만난 뒤 카카오 로그인으로 진입. (사용자 요청: donghaeng.club처럼
  모임이 첫 콘텐츠로 오는 콘텐츠 중심 구성.)
- 사용자 상태: 게스트 (로그인 시 헤더 로고가 /community로).
- 구조 (순서 고정):
  1. `.stage` 히어로 — 카피 좌측/상단, 빛 웅덩이 중앙 하단, CTA 2개(카카오 시작/소개 보기)
  2. 오프라인 모임 — `paper` 라이트 밴드가 히어로 바로 아래. 준비 중인 모임 예시 3건
     (괘선 그리드), 정회원 전용 링크 정책 설명. 게스트는 실데이터를 읽을 수 없으므로(RLS)
     예시임을 명시 — 가짜 일정/참석 수치 금지.
  3. 게시판 + 이야기 미리보기 — 좌: 번호 인덱스 8개, 우: seed 실데이터 글 스트립 4개
  4. 존재 이유 — 비대칭 2단 (좌: 큰 문장, 우: 본문 + /about 링크)
  5. 등급·안전 — dl 괘선 행 3개(신규/정회원/튜터) + 이용수칙 링크
  6. 최종 CTA — `.stage-echo` 잔광 + 카카오 버튼
- 모바일: 히어로 `pb-[28svh]`로 무대 유지, 밴드/2단은 세로 스택.
- 금지: 가짜 수치/후기, 8개 동일 카테고리 카드 그리드.

## /about, /guidelines, /login — (public)

- 폭 760px 아티클. 라벨(accent-soft) → 페이지 타이틀 → 본문 순.
- about: accent 좌측 보더 인용구 + 괘선 섹션 3개 + CTA.
- guidelines: 번호(tnum) + 제목/설명 2단 괘선 행 9개.
- login: `.stage-echo`, 카카오 버튼 2개(로그인/시작하기)만. 이메일/비밀번호 UI 없음.

## /onboarding

- 폭 md 단일 컬럼 포커스 폼: 닉네임, 현재 상태, 활동 분야, 지역, 기대(멀티 칩 토글).
- 완료 시 member_level=new_member, /community로 리다이렉트. 미완료 사용자는 커뮤니티 접근 불가(layout 게이트).

## /community (홈) — (community)/community/page.tsx

- 정보 위계: 공지 → 오프라인 모임 하이라이트 → 최신 글 → (레일) 오늘의 질문/인기/게시판/등급.
- 데스크톱(lg+): `grid-cols-[1fr_300px]`. 메인 = NoticeStrip(괘선, 홈에만) + FeaturedMeetup + 최신 글 CommunityPostRow 목록. 레일(sticky) = 글쓰기 버튼, CommunitySidebar.
- 모바일: 검색+글쓰기 행 → CategoryScroller → 공지 → 모임 하이라이트 → 오늘의 질문(보더 스트립) → 최신 → 인기.
- 빈 상태: "아직 글이 없습니다" + 글쓰기 버튼.

## /community/[categorySlug] (게시판)

- 폭 860px. 헤더(카테고리명+설명, 하단 괘선) → [현장후기 경고 WarningBox] → 카테고리 내 검색 + 글쓰기 → 정렬 언더라인 탭(최신/인기/댓글/북마크) → CommunityPostRow 목록(카테고리 라벨 숨김) → 이전/다음 페이지네이션.
- 모임 게시판 행: 오프라인/정회원 전용 마크 + 지역/날짜/시간/모집 tnum 메타.

## /posts/[postId] (글 상세)

- 폭 760px 에디토리얼 아티클: 카테고리 링크 → 제목(23/27px) → 작성자+배지 · 날짜 · 조회 → (모임이면 accent 좌측 보더 상세 패널: dl 메타 + 신청 버튼 or 제한 안내) → 본문 16px/1.8 → 이미지 → 태그(사각 보더 칩) → 중앙 좋아요/북마크 → 댓글.
- 댓글: 카드 아님. 괘선 행(작성자+배지 / 날짜 / 삭제·신고) + CommentForm. 정지 계정은 안내문.
- 신청 링크: `get_meetup_application_url` RPC 결과 있을 때만 버튼. 없으면 등급/정지 안내 문구.
- 숨김 글: 상단 warning 스트립.

## /write, /edit/[postId]

- 폭 720px 포커스 폼, 사이드바 없음. 카테고리 셀렉트 → 카테고리별 헬퍼(보더 스트립) → 제목/내용/태그 → 이미지(최대 5, jpg/png/webp, 5MB) → 모임이면 "오프라인 모임 정보" 괘선 섹션(지역/장소/날짜/시간/인원/참가비/신청 링크/정회원 전용).
- 검증 에러는 해당 필드 아래 FieldError. 익명 토글 없음.

## /search

- 폭 860px. SearchInput → "'q' 검색 결과 n건" → CommunityPostRow 목록.
- 미입력/무결과는 EmptyState.

## /me, /me/edit

- 폭 860px. 아이덴티티 블록(아바타, 닉네임+배지, 상태·분야·지역, bio, 프로필 수정 버튼, 하단 괘선) → 언더라인 탭(내 글/북마크/좋아요) → CommunityPostRow 목록.
- 커뮤니티 프로필임 — 키/몸무게/소속사/필모 등 캐스팅 필드 금지.
- /me/edit: 닉네임/상태/분야/지역/bio/아바타만. role·등급·정지 상태는 수정 불가.

## /resources/submit

- 폭 720px 폼(제목/내용/출처/제보 이유). 제출 후 접수 확인 화면.

## 관리자 공통 — apps/admin

- 라이트 운영 UI. 상단 흰 헤더(액트원 관리자 + 로그아웃), lg+ 좌측 224px 내비, 본문 유동.
- 목록은 밀도 있는 행/테이블 + StatusBadge(성공/경고/위험 토큰). 파괴적 동작은 ConfirmButton(danger).
- 모든 페이지 requireAdmin() 통과. 비인가는 /denied.

### /(dashboard) 대시보드

- 통계 6칩(전체/오늘 회원·게시글, 대기 신고·제보, tnum) → 최근 신고 5 → 최근 게시글 5.

### /members, /members/[id]

- 검색 + 목록(닉네임, 등급 배지, 정지 상태, 가입일). 상세: 프로필 요약, 활동 수, 받은 신고 수, 등급 수동 변경 폼(사유 필수, member_level_logs 기록), 정지/해제, 등급 변경 이력.

### /settings (등급 설정)

- 자동 승급 rule 폼: enabled(기본 OFF), minDaysAfterJoin, minPostCount, minCommentCount, maxReceivedReports.

### /posts, /comments

- 검색/카테고리/상태 필터 + 숨김/복구/삭제 액션.

### /reports, /reports/[id]

- 목록(대상 유형, 사유, 상태 배지, 일시). 상세: 대상 내용 확인, 처리/기각 + 관리자 메모 + 대상 숨김.

### /submissions, /submissions/[id]

- 제보 목록/상세. 승인 → resources 글 생성(작성자 "액트원 운영진"), 거절 → 메모 저장.

### /notices, /categories, /admins

- 공지 CRUD(고정 포함), 카테고리 이름/설명/순서/활성, 관리자 계정 활성/비활성·추가.
