# 액트원 (Act One)

인맥 없이 배우를 시작한 사람들을 위한 한국어 배우 커뮤니티. 오디션 정보, 현장 후기, 오프라인 모임, 스터디, 배우 생존 이야기를 나눈다. 커뮤니티 전용 MVP이며 캐스팅 플랫폼·배우 DB·AI 추천·유료 기능이 아니다.

## 모노레포 구조

```
apps/web        # 사용자 커뮤니티 (actone.kr) — 다크 백스테이지 에디토리얼
apps/admin      # 분리된 관리자 사이트 (admin.actone.kr) — 라이트 운영 UI
packages/shared # 타입, 상수, zod 스키마, Supabase 클라이언트, siteConfig
supabase/       # migrations(0001 schema, 0002 rls, 0003 post_images) + seed.sql + tests/
e2e/            # 로컬 Supabase 호환 스택 기반 브라우저 E2E 하네스
```

## 주요 명령어

```bash
npm install
npm run dev:web            # 사용자 사이트 dev
npm run dev:admin          # 관리자 사이트 dev
npm run lint               # 양쪽 앱 eslint
npm run build              # 양쪽 앱 build
npm run build --workspace apps/web
npm run build --workspace apps/admin
```

## 절대 바꾸면 안 되는 보안 경계

- 오프라인 모임 `application_url`은 `get_meetup_application_url` RPC로만 노출.
  `offline_meetup_public` 뷰나 select에 이 컬럼을 추가하지 말 것.
- 관리자 접근 = Kakao 로그인 + `profiles.role='admin'` + `admin_users.is_active=true` 3중 검증 (`apps/admin/lib/admin.ts`의 `requireAdmin`). 서버 액션마다 재검증.
- 사용자는 자신의 `role`/`member_level`/`is_suspended`를 수정할 수 없다 (DB `protect_*` 트리거 + RLS).
- 튜터 자동 부여 경로를 만들지 말 것 (수동 전용, `member_level_logs` 기록).
- 정회원 자동 승급 기본값은 OFF (`app_settings.regular_member_rule.enabled=false`).
- 카테고리 slug 변경 금지 — RLS/권한 로직이 slug 문자열에 의존.
- 사용자 사이트에 `/admin` 경로를 만들지 말 것.

## 이번 MVP 제외 기능

이메일 가입/로그인/비밀번호, 익명 게시, 프로필 피드백, 배우 DB, 캐스팅 매칭,
AI 추천/평가, 결제/구독, DM/채팅/알림, 팔로우, 외부 크롤링, 모바일 앱, B2B, 강의.
추가하고 싶어도 추가하지 말 것.

## 디자인 시스템

- `ACTONE_DESIGN_SYSTEM.md` — 토큰, 타이포, 스포트라이트 히어로 규격, 금지 패턴
- `ACTONE_PAGE_SPECS.md` — 페이지별 레이아웃/상태
- `ACTONE_DESIGN_QA.md` — 뷰포트 검수 기록, 스크린샷 경로(docs/design-screenshots/)
- 메인 랜딩 첫 화면은 반드시 "한 줄기 스포트라이트를 받는 빈 무대" (CSS 레이어드 그라디언트, `apps/web/app/globals.css`의 `.stage*`)
- 기본 shadcn 외형·일반적인 AI 템플릿 카드 그리드 금지. 게시판은 카드가 아닌 행(list-first).

## 인수인계 문서

`ACTONE_HANDOFF.md` → `ACTONE_FEATURE_STATUS.md` → `ACTONE_TODO_NEXT_MODEL.md` 순으로 읽고 시작.
세부: `ACTONE_MASTER_SPEC.md`, `ACTONE_DB_SCHEMA.md`, `ACTONE_RLS_NOTES.md`,
`ACTONE_ADMIN_SITE_NOTES.md`, `ACTONE_MEMBER_LEVEL_NOTES.md`.

## 진행 방식

- 아키텍처/스키마/RLS/권한/디자인 방향 변경은 신중히 — 검증된 문제일 때만.
- 가장 좁은 검증부터: 변경 패키지 typecheck → lint → 해당 앱 build → 전체 build.
- 결정 사항은 채팅이 아니라 위 MD 문서에 기록하고 단계마다 갱신.
- 반복 작업은 `.claude/agents/`의 서브에이전트 활용 가능. 아키텍처·보안·디자인 최종 승인은 메인 모델이 한다.
