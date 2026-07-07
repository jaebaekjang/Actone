# ACTONE HANDOFF

다른 모델(Opus/Sonnet 등)이 이어서 작업하기 위한 문서. 먼저 `ACTONE_MASTER_SPEC.md`를 읽고, 세부는 각 노트 문서를 참고할 것.

## 완료된 것

- npm workspaces monorepo (`apps/web`, `apps/admin`, `packages/shared`)
- Supabase 스키마/RLS 마이그레이션 + seed (파일 작성 완료, **인스턴스 미적용**)
- 사용자 사이트 전체 페이지 + 커뮤니티 CRUD/좋아요/북마크/신고/검색/마이페이지/자료 제보
- 회원 등급 시스템(수동 변경/로그/자동 승급 규칙 기본 OFF)
- 오프라인 모임 신청 링크 서버측 접근 제한(뷰 + security definer RPC)
- 분리된 관리자 사이트 전체(대시보드~관리자 계정 관리)
- 푸터(사업자 정보/소셜), 카카오채널 플로팅 버튼, 모바일 하단 내비
- lint/build 양쪽 앱 통과 (ACTONE_FEATURE_STATUS.md 참고)

## 부분 완료 / 미검증

- **마이그레이션+RLS는 로컬 PostgreSQL 16에서 검증 완료** (`supabase/tests/`, 26건 PASS).
- **브라우저 E2E 49/49 PASS** (`e2e/` 하네스) — 실제 앱을 로컬 Supabase 호환 스택으로 구동해 사용자/관리자 핵심 플로우 전부 화면 단위 검증.
- 남은 미검증: 실제 Supabase 인스턴스의 카카오 OAuth 리다이렉트, Storage 실업로드(아바타/게시글 이미지), 실제 PostgREST 동작. `ACTONE_TODO_NEXT_MODEL.md` 참고.

## 미구현 (스펙상 선택)

- 없음. 게시글 이미지 업로드(post_images)까지 구현됨. 수정 시 제거된 이미지의 Storage 파일 정리만 남음(참조만 삭제됨).

## 핵심 파일 경로

```
packages/shared/src/
  config/site.ts          # siteConfig (사업자 정보, 소셜 링크 — 여기만 수정)
  constants/index.ts      # 카테고리 slug, 등급, 신고 사유, 안내 문구 등 전 도메인 상수
  types/index.ts          # DB row 타입
  validation/index.ts     # 모든 zod 스키마 (웹/관리자 공용)
  lib/supabase/           # env fallback, browser/server 클라이언트 팩토리

apps/web/
  middleware.ts           # 세션 갱신 + 보호 경로 리다이렉트
  lib/supabase.ts         # cookies() → shared server client
  lib/data.ts             # getUserAndProfile(cache), 카테고리, author/category 조인 헬퍼
  lib/actions/            # auth(온보딩·로그아웃)/posts/engagement(댓글·좋아요·북마크·신고)/profile/resources
  app/(public)/           # 랜딩, about, guidelines, login
  app/(community)/        # 커뮤니티 전체 (layout이 온보딩 게이트)
  app/onboarding/, app/auth/callback/
  components/             # Header, Footer, MobileNav, PostCard, PostForm, 배지, 신고 다이얼로그 등

apps/admin/
  lib/admin.ts            # requireAdmin() — 관리자 접근의 핵심
  lib/actions.ts          # 모든 관리자 서버 액션
  app/(dashboard)/        # 관리자 페이지 전부
  app/login, app/denied, app/auth/callback

supabase/migrations/0001_schema.sql   # 테이블/인덱스/카운터 트리거/handle_new_user
supabase/migrations/0002_rls.sql      # RLS 전체 + 보호 트리거 + 뷰 + RPC + 자동 승급 + avatars 버킷
supabase/migrations/0003_post_images.sql # 게시글 이미지(5장 제한 트리거, post-images 버킷)
supabase/seed.sql                     # 카테고리 8개, rule(OFF), 샘플 글
supabase/tests/                       # 로컬 Postgres 검증 하네스 (README에 실행법)
```

## 이어서 작업하는 방법

1. `npm install` → `npm run build` 로 그린 상태 확인.
2. Supabase 프로젝트 만들고 README대로 마이그레이션 적용 + 카카오 OAuth 설정.
3. `.env.local`을 `apps/web`, `apps/admin`에 생성.
4. `ACTONE_TODO_NEXT_MODEL.md` 검증 시나리오 실행, 발견된 버그 수정.
5. 기능 추가 전 반드시 MASTER_SPEC의 "제외 기능" 확인 — 스코프를 늘리지 말 것.

## 경고 (하지 말 것 / 깨지기 쉬운 곳)

- **카테고리 slug 변경 금지** — `ADMIN_ONLY_CATEGORY_SLUGS`, 오프라인 모임 로직, RLS insert 정책이 slug 문자열에 의존.
- **application_url을 select에 추가하지 말 것** — 노출 경로는 `get_meetup_application_url` RPC 하나여야 함. `offline_meetup_public` 뷰에 컬럼을 추가하면 보안 요구사항 위반.
- 이메일 로그인/익명 게시를 어떤 형태로도 추가하지 말 것.
- 튜터 자동 부여 경로를 만들지 말 것.
- `protect_*` DB 트리거는 `current_user`로 검사 — 새 security definer 함수는 보호 컬럼을 우회할 수 있으니 신중히.
- shared 패키지는 `.ts` 소스 그대로 export되고 Next `transpilePackages`로 컴파일됨 — shared에 빌드 스텝을 추가하지 말 것.
- `NEXT_PUBLIC_*` env가 없어도 빌드되도록 placeholder fallback이 있음 — 프로덕션에서 placeholder로 배포되지 않게 주의.
