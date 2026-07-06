# ACTONE CONTINUATION PROMPT (2026-07-06)

이 문서는 **새 프로젝트/세션에서 액트원 작업을 이어받기 위한 시작 프롬프트**다.
원본 빌드 프롬프트(`ACTONE_COMMUNITY_FINAL_BUILD_PROMPT.md`)의 후속 버전으로, 빌드 단계는 완료되었고 지금은 **검증·배포 단계**다.

함께 업로드되는 문서 세트(우선순위 순으로 읽을 것):

1. `ACTONE_SESSION_HANDOVER_2026-07-06.md` — 직전 세션 인수인계 (git 상태, 변경 파일, 다음 할 일)
2. `ACTONE_MASTER_SPEC.md` — 제품 범위 단일 기준 (코드와 충돌 시 이 문서 우선)
3. `ACTONE_TODO_NEXT_MODEL.md` — 검증 시나리오 체크리스트
4. 나머지: `ACTONE_HANDOFF.md` / `ACTONE_FEATURE_STATUS.md` / `ACTONE_DB_SCHEMA.md` / `ACTONE_RLS_NOTES.md` / `ACTONE_ADMIN_SITE_NOTES.md` / `ACTONE_MEMBER_LEVEL_NOTES.md` / `README.md`

---

## 0. Context

액트원(Act One)은 인맥 없이 배우를 시작한 사람들을 위한 한국어 커뮤니티 웹사이트다.

- 메인 메시지: "인맥 없이 배우를 시작했다면, 혼자 버티지 않아도 됩니다."
- 커뮤니티 **전용**. 캐스팅 플랫폼/배우 DB/AI 추천/유료 구독/B2B가 아니다.
- 카카오 로그인 전용 (이메일 가입/로그인/비번 재설정 없음)
- 모바일 퍼스트, 다크 극장 무드(차콜 #0F0F10 + 오렌지 #F97316), Pretendard

스택: Next.js 15 App Router · TypeScript · Tailwind v4 · Supabase (Auth/PostgreSQL/Storage/RLS) · React Hook Form · Zod · 배포: Vercel + Supabase

## 1. Operating Instructions

- 정보가 충분하면 즉시 실행하라. 이미 확정된 사실/결정을 다시 논하지 마라.
- 진행 보고는 결과부터. 파일 경로/명령 출력/테스트 결과 등 증거 기반으로만 보고하라.
- 미검증 항목은 명시적으로 미검증이라고 말하라. 테스트 실패는 실제 출력과 함께 보고하라.
- 멈춰야 할 때: 파괴적/비가역 작업, 실제 스코프 변경, 사용자만 줄 수 있는 시크릿 필요, 안전하게 추론 불가한 제품 결정. 그 외에는 계속 진행.

## 2. 현재 상태 (2026-07-06 기준 — 정확함)

### 완료 (코드 작성 + lint/build 통과)

- npm workspaces monorepo: `apps/web`(사용자, actone.kr) / `apps/admin`(관리자, admin.actone.kr) / `packages/shared`
- 사용자 사이트 전체: 랜딩/about/guidelines/login, 온보딩, 커뮤니티 홈, 8개 카테고리 보드,
  글 CRUD(soft-delete), 댓글, 좋아요, 북마크, 신고, 검색, 마이페이지, 프로필 수정(아바타 업로드),
  자료 제보, 푸터(브릿로드 사업자 정보+소셜 5종), 카카오채널 플로팅 버튼, 모바일 하단 내비
- **게시글 이미지 업로드(post_images)**: write/edit 폼(최대 5장, jpg/png/webp, 각 5MB),
  상세 페이지 렌더, `post-images` 버킷, 서버는 본인 폴더 URL만 수용 — 2026-07-06 구현 완료
- 검색 결과 카드에도 오프라인 모임 정보(지역/날짜/시간/인원) 표시 — 동일 세션 완료
- 회원 등급: new_member/regular_member/tutor, 수동 변경+로그, 자동 승급 규칙(기본 OFF), 튜터 수동 전용
- 오프라인 모임 신청 링크 서버측 접근 제한: `offline_meetup_public` 뷰(URL 컬럼 없음) + `get_meetup_application_url` RPC
- 분리된 관리자 사이트 전체: 대시보드/회원(상세·등급·정지)/등급설정/글/댓글/신고/제보/공지/카테고리/관리자 계정
- DB: 마이그레이션 3개(`0001_schema.sql`, `0002_rls.sql`, `0003_post_images.sql`) + `seed.sql`
  (테이블 13, 뷰 2, RPC/트리거, avatars·post-images 버킷)
- 전 테이블 RLS + 보호 컬럼 트리거 + 게스트 완전 차단 + 정지 회원 쓰기 차단
- 앱별 `.env.example` (루트/apps/web/apps/admin)
- `npm run lint` 에러/경고 0, `npm run build` web 16 + admin 20 라우트 통과
- 로컬 dev 서버 렌더링 확인 완료(공개 페이지 4종, 모바일 390px 오버플로우 없음)

### 미완료 (이번에 할 일)

- **Supabase 실인스턴스 적용/검증 0%** — 자격 증명이 없어 SQL/RLS/OAuth가 실제 인스턴스에서 한 번도 실행되지 않음
- Vercel 배포, 도메인 연결, 카카오 OAuth 실연동, 최초 관리자 설정
- `siteConfig.socialLinks` 실제 URL 채우기 (현재 빈 문자열 → "준비 중입니다" 토스트)

### Git

- 리포: `jaebaekjang/Actone` · 기본 브랜치: `claude/act-one-community-mvp-oqqf0u`
- **최신 작업 브랜치: `claude/markdown-file-recognition-92as9b`** (커밋 `758e3cb`, `4cf628d`, `c51fd2b` — 전부 푸시됨)
- PR 미생성. 새 작업은 최신 브랜치에서 시작하거나 사용자 지시에 따라 머지 후 진행.

## 3. Priority Work Order

### Phase 1. 리포 그린 확인

```bash
git checkout claude/markdown-file-recognition-92as9b   # 또는 머지된 최신 브랜치
npm install && npm run lint && npm run build
```

실패 시 원인 수정 후 진행. (2026-07-06 통과 상태였음)

### Phase 2. Supabase 실인스턴스 적용 (사용자 자격 증명 필요)

1. Supabase 프로젝트 생성 → SQL Editor에서 순서대로:
   `0001_schema.sql` → `0002_rls.sql` → `0003_post_images.sql` → `seed.sql`
   에러 시 해당 구문 수정 (storage 정책은 프로젝트 설정에 따라 권한 이슈 가능)
2. 카카오 OAuth: README 절차 (Kakao Developers 앱 → Supabase Kakao Provider → Redirect URI 등록)
3. `apps/web/.env.local`, `apps/admin/.env.local` 생성 (각 `.env.example` 복사)

### Phase 3. 검증 시나리오 실행 (ACTONE_TODO_NEXT_MODEL.md §1 전체)

핵심 체크: 카카오 로그인→온보딩→커뮤니티, profiles 자동 생성(new_member),
글/댓글/좋아요/북마크/신고, 카운터 갱신, **이미지 업로드→상세 표시**,
신규회원 모임 링크 숨김/정회원 표시, 게스트 REST 직접 조회 빈 결과, 정지 계정 쓰기 실패,
관리자 /denied·등급 변경 로그·신고 처리·제보 승인("액트원 운영진" 표시), 자동 승급 ON/OFF 동작.

버그 예상 지점(TODO §2): `handle_new_user` 카카오 메타데이터 키, 뷰 grant 충돌,
검색 특수문자 PostgREST 파싱, 카카오 CDN 아바타 도메인(next.config remotePatterns).

### Phase 4. 배포

- Vercel 프로젝트 2개 (Root Directory: `apps/web` / `apps/admin`) + env 설정
- 도메인 actone.kr / admin.actone.kr 연결, Supabase Redirect URL에 프로덕션 콜백 2개 등록
- 최초 관리자: README SQL (`profiles.role='admin'` + `admin_users.is_active=true` **둘 다** 필요)

### Phase 5. 문서 갱신

작업 후 변경 사항을 `ACTONE_FEATURE_STATUS.md`, `ACTONE_TODO_NEXT_MODEL.md`에 반영하고,
스펙이 바뀌면 `ACTONE_MASTER_SPEC.md`를 갱신하라.

## 4. 하지 말 것 (위반 시 보안/스코프 사고)

1. **카테고리 slug 변경 금지** — `ADMIN_ONLY_CATEGORY_SLUGS`, 모임 로직, RLS insert 정책이 slug 문자열에 의존
2. **`application_url`을 select/뷰에 추가 금지** — 노출 경로는 `get_meetup_application_url` RPC 하나뿐
3. 제외 기능 추가 금지: 이메일 가입/로그인/비번 재설정, 익명 게시, 프로필 피드백, 배우 DB, 제작사 계정,
   캐스팅 매칭, AI 추천/평가, 결제/구독, DM/채팅, 알림, 팔로우, 오디션 크롤링, 모바일 앱, B2B, 강의
4. 튜터 자동 부여 경로 금지 (관리자 수동 전용, 모든 변경은 member_level_logs 기록)
5. `protect_*` 트리거는 `current_user`로 검사 — 새 security definer 함수는 보호 컬럼 우회 가능하니 신중히
6. shared 패키지에 빌드 스텝 추가 금지 (`.ts` 소스 그대로 export, Next `transpilePackages`로 컴파일)
7. `NEXT_PUBLIC_*` placeholder fallback 존재 — 프로덕션에 placeholder 값으로 배포되지 않게 확인
8. 사용자 사이트에 `/admin` 라우트 추가 금지 (관리자 기능은 전부 `apps/admin`)

## 5. 핵심 파일 경로

```
packages/shared/src/
  config/site.ts          # siteConfig (사업자 정보, 소셜 링크 — 여기만 수정)
  constants/index.ts      # slug, 등급, 신고 사유, 이미지 규칙, 안내 문구 등 전 도메인 상수
  types/index.ts          # DB row 타입 (PostImage 포함)
  validation/index.ts     # 모든 zod 스키마 (postSchema.image_urls 포함)
  lib/supabase/           # env fallback, browser/server 클라이언트 팩토리

apps/web/
  middleware.ts                       # 세션 갱신 + 보호 경로
  lib/data.ts                         # getUserAndProfile(cache), 조인 헬퍼
  lib/actions/                        # auth/posts(이미지 포함)/engagement/profile/resources
  components/post-form.tsx            # 글 폼 (모임 필드 + 이미지 업로드)
  app/(community)/posts/[postId]/     # 상세 (모임 게이트 + 이미지 렌더)

apps/admin/
  lib/admin.ts            # requireAdmin() — 모든 페이지/액션의 관문
  lib/actions.ts          # 전 관리자 액션 (첫 줄 requireAdmin)

supabase/migrations/0001_schema.sql       # 테이블/인덱스/카운터 트리거/handle_new_user
supabase/migrations/0002_rls.sql          # RLS/보호 트리거/뷰/RPC/자동 승급/avatars 버킷
supabase/migrations/0003_post_images.sql  # post_images + 5장 제한 트리거 + post-images 버킷
supabase/seed.sql                         # 카테고리 8, rule(OFF), 샘플 글 6
```

## 6. Success Criteria (이번 단계)

1. 마이그레이션 4개 파일이 실제 Supabase 인스턴스에 에러 없이 적용됨
2. 카카오 로그인 → 온보딩 → 커뮤니티 진입이 실제로 동작
3. TODO §1 검증 시나리오 전 항목 통과 (실패 항목은 수정 후 재검증)
4. 이미지 업로드가 실제 Storage에 대해 동작 (최대 5장 제한 포함)
5. 신청 링크가 신규회원/정지 회원에게 **네트워크 응답에서도** 전송되지 않음 확인
6. 관리자 사이트 이중 접근 조건이 실제로 강제됨
7. 양쪽 앱이 프로덕션 도메인에서 서비스됨
8. 문서가 최종 상태로 갱신됨

보고 형식: ① 결과 ② 증거(파일/출력) ③ 검증 결과 ④ 남은 것/막힌 것.
