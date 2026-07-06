# ACTONE MASTER SPEC

최종 제품 범위의 단일 기준 문서. 다른 모델이 작업을 이어갈 때 이 문서와 코드가 충돌하면 이 문서 기준으로 판단하고, 변경 시 이 문서를 갱신할 것.

## 제품 정의

액트원은 인맥 없이 배우를 시작한 사람들을 위한 한국어 커뮤니티 웹사이트.

- 메인 메시지: "인맥 없이 배우를 시작했다면, 혼자 버티지 않아도 됩니다."
- 서브 메시지: "액트원은 오디션 정보, 현장 후기, 오프라인 모임, 스터디, 배우 생존 이야기를 함께 나누는 배우 커뮤니티입니다."
- 커뮤니티 **전용**. 캐스팅/매칭/DB/AI/유료 기능 아님.
- 모바일 퍼스트, 다크 극장 무드(차콜 배경 + 오렌지 액센트), Pretendard.

## 포함 기능 (구현됨)

- 카카오 로그인(Supabase Auth) — 유일한 로그인 수단
- 온보딩(닉네임, actor_status, activity_field, region, expectation[])
- 커뮤니티 홈(공지 상단, 오늘의 질문, 카테고리 카드, 인기/최신 글)
- 8개 카테고리 게시판(정렬: 최신/인기/댓글/북마크, 보드 내 검색, 페이지네이션)
- 글 작성/읽기/수정/soft-delete, 댓글(단일 계층), 좋아요, 북마크, 신고
- 검색 `/search?q=` (제목/내용/태그)
- 마이페이지(내 글/북마크/좋아요 탭), 프로필 수정(아바타 업로드 포함)
- 회원 등급: new_member / regular_member / tutor (+ role: member/admin 별도)
- 오프라인 모임 신청 링크 접근 제한(정회원/튜터/관리자만, 서버측 강제)
- 자료 제보 → 관리자 승인 → 자료실 게시(운영진 명의)
- 분리된 관리자 사이트(apps/admin) + 이중 접근 조건
- 푸터(브릿로드 사업자 정보 + 소셜 링크), 카카오채널 플로팅 버튼
- Supabase RLS 전 테이블 적용

## 제외 기능 (절대 추가하지 말 것)

이메일 가입/로그인/비밀번호 재설정, 익명 게시, 프로필 피드백 게시판/사진 피드백,
지원 메일 피드백, 배우 DB, 제작사 계정, 캐스팅 매칭, AI 추천/프로필 평가,
결제/유료 구독, DM/채팅, 알림, 팔로우/팔로워, 외부 오디션 크롤링, 모바일 앱,
B2B 대시보드, 강의/클래스.

## 카테고리 구조 (seed 순서 고정)

| # | 이름 | slug | 특이사항 |
|---|---|---|---|
| 1 | 오프라인 모임 | `offline-meetups` | 최우선 노출. 신청 링크는 정회원+ 전용. 내부 신청 DB 없음(외부 링크) |
| 2 | 배우 생존방 | `actor-survival` | |
| 3 | 오디션 정보 공유방 | `audition-info` | 자동 매칭 아님. 회원 정보 공유 게시판. 작성 폼에 권장 항목 안내 |
| 4 | 스터디 | `study` | 이름은 반드시 `스터디` |
| 5 | 현장 후기방 | `field-reviews` | 작성 전 실명 저격/명예훼손 경고 표시 |
| 6 | 자유게시판 | `free-board` | |
| 7 | 자료실 | `resources` | 관리자만 직접 게시. 회원은 `/resources/submit`으로 제보만 |
| 8 | 공지사항 | `notices` | 관리자만 작성. 커뮤니티 홈 상단에만 노출 |

slug는 코드 로직(`ADMIN_ONLY_CATEGORY_SLUGS`, 오프라인 모임 필드, RLS 정책)에 사용되므로 변경 금지. 관리자 카테고리 관리 UI도 slug 수정을 제공하지 않음.

## 인증 플로우

1. `카카오로 시작하기/로그인` 클릭 → `supabase.auth.signInWithOAuth({provider:'kakao'})`
2. 카카오 → Supabase → `/auth/callback` (양쪽 앱 각각 존재)
3. `auth.users` insert 트리거 `handle_new_user`가 profiles 자동 생성 (callback에 fallback insert도 있음)
4. `onboarding_completed = false` → `/onboarding`, true → `/community`
5. 온보딩 완료 시 `onboarding_completed = true`, `member_level = 'new_member'`(기본값)
6. 보호 라우트: middleware(세션) + (community) 레이아웃(온보딩 게이트)

## 회원 등급 규칙 (요약 — 상세는 ACTONE_MEMBER_LEVEL_NOTES.md)

- `role` (member/admin) = 시스템 권한, `member_level` (new_member/regular_member/tutor) = 커뮤니티 지위. 혼용 금지.
- 튜터는 **관리자 수동 지정 전용**. 자동 부여 경로 없음.
- 정회원 자동 승급 규칙은 `app_settings.regular_member_rule`, 기본 `enabled: false`.
- 모든 등급 변경은 `member_level_logs`에 기록(manual/automatic).

## 관리자 사이트 (요약 — 상세는 ACTONE_ADMIN_SITE_NOTES.md)

- `apps/admin`, 배포 대상 `admin.actone.kr`. 사용자 사이트에 `/admin` 없음.
- 접근 = 카카오 로그인 + `profiles.role='admin'` + `admin_users.is_active=true` (모두 충족).
- 실패 시 `/denied`: "접근 권한이 없습니다. 관리자에게 문의해주세요." + 로그아웃 버튼.
- 페이지: 대시보드, 회원 관리(+상세/등급변경/정지), 회원 등급 설정, 게시글/댓글/신고/자료 제보/공지/카테고리/관리자 계정 관리.

## UI 방향

- 색상: 배경 #0F0F10, 서피스 #18181B/#232326, 텍스트 #F4F4F5/#A1A1AA, 액센트 #F97316, 보더 #2F2F33, 튜터 골드 #EAB308 (Tailwind v4 `@theme`, `apps/*/app/globals.css`)
- 튜터 배지: 골드 필 + 별 아이콘, 신뢰감 있게 강조. 튜터 글 자동 고정 금지(고정은 관리자 전용).
- 게시글/댓글 작성자에는 항상 `닉네임 · 등급배지`. 운영진 글(자료실/공지/author 없음)은 `액트원 운영진 · 운영진`.

## 검증 규칙

- 글: 제목 ≥2자, 내용 ≥10자, 태그 ≤5, 익명 토글 없음, 정지 회원 작성 불가
- 댓글: 2~1000자, 정지 회원 불가
- 자료 제보: 제목/내용 필수, source_url/submission_reason 선택, 정지 회원 불가
- 모임: application_url 선택. 있으면 비인가 사용자에게 절대 서버가 전송하지 않음
- 아바타: jpg/png/webp, 5MB 이하
