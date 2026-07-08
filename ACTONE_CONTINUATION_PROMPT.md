# ACTONE 이어받기 프롬프트 (Opus / Sonnet / 기타 모델용)

> **사용법**: 이 파일 하나를 다음 모델에게 그대로 주면 됩니다. 이 문서가 최신 상태의
> 단일 기준이며, 세부 사항은 문서 맨 아래 "문서 인덱스"의 파일들을 참고하세요.
> 작성 시점: 2026-07-07, 브랜치 `claude/act-one-community-mvp-oqqf0u`, 최신 커밋 `8e2fc63`.

---

## 0. 지시사항 (이어받는 모델에게)

1. **처음부터 다시 계획하지 마세요.** 아키텍처는 확정됐고 검증까지 끝났습니다.
   빌드가 깨지는 문제가 실측으로 확인되지 않는 한 구조를 바꾸지 마세요.
2. 시작 절차: 이 문서 → `ACTONE_MASTER_SPEC.md`(스코프) → `ACTONE_HANDOFF.md`(파일 맵) 순서로 읽고,
   `npm install && npm run build`로 그린 상태를 확인한 뒤 "3. 남은 작업"부터 진행하세요.
3. 진행 보고는 결과 우선으로, 파일 경로/명령 출력 등 증거와 함께 하세요.
4. 스코프를 늘리지 마세요. "5. 절대 하지 말 것"이 스코프 가드입니다.

---

## 1. 프로젝트 한 줄 요약

**액트원(Act One)** — 인맥 없이 배우를 시작한 사람들을 위한 한국어 커뮤니티 웹사이트.
커뮤니티 전용(캐스팅/DB/AI/유료 아님). 모바일 퍼스트, 다크 극장 테마, 카카오 로그인 전용.

- 스택: Next.js 15 App Router + TypeScript + Tailwind v4 + Supabase(Auth/PG/Storage/RLS) + RHF + Zod
- 구조: npm workspaces 모노레포
  - `apps/web` → actone.kr (사용자 사이트, `/admin` 없음)
  - `apps/admin` → admin.actone.kr (완전 분리된 관리자 사이트)
  - `packages/shared` (siteConfig·상수·타입·zod·supabase 클라이언트)
  - `supabase/migrations` 4개 파일 + `seed.sql`
  - `supabase/tests` (SQL 레벨 RLS 테스트), `e2e` (브라우저 E2E 하네스)

---

## 2. 완료된 것 (전부 검증 증거 있음)

### 코드 (커밋 1ebe668 → a9c84ad → 8e2fc63)

| 영역 | 상태 |
|---|---|
| 사용자 사이트 전체 | ✅ 랜딩/소개/이용수칙/로그인(카카오만)/콜백/온보딩/커뮤니티 홈/8개 게시판(정렬4종·검색·페이지네이션)/글 CRUD+soft delete/댓글/좋아요/북마크/신고/검색/마이페이지/프로필 수정(아바타 업로드)/자료 제보/푸터(브릿로드 사업자 정보+소셜)/카카오채널 플로팅 버튼/모바일 하단 내비 |
| 게시글 이미지 | ✅ 최대 5장, jpg/png/webp, 5MB (0003 마이그레이션 + 폼 업로더 + 상세 표시) |
| 관리자 사이트 | ✅ 카카오 로그인, 이중 접근 조건(`profiles.role='admin'` **AND** `admin_users.is_active`), /denied, 대시보드, 회원 관리(등급 수동 변경·정지·이력), 등급 설정(자동 승급 기본 OFF), 게시글/댓글/신고/자료 제보/공지/카테고리/관리자 계정 관리 |
| 회원 등급 | ✅ new_member(기본)/regular_member/tutor. 튜터는 수동 전용. 모든 변경 `member_level_logs` 기록. 자동 승급은 DB 트리거, `enabled:false` 기본 |
| 오프라인 모임 보안 | ✅ `application_url`은 안전 뷰(`offline_meetup_public`)에 컬럼 자체가 없고, security definer RPC(`get_meetup_application_url`)만이 정회원/튜터/관리자에게 반환. 신규/정지 회원에겐 서버가 URL을 아예 전송 안 함 |
| DB/RLS | ✅ 13개 테이블 전부 RLS + 보호 컬럼 트리거(자기 role/member_level/is_suspended 변경 차단) + 카운터 트리거 |

### 검증 (실제 실행한 결과 — 재확인 명령은 §6)

1. `npm run lint` — 에러/경고 0
2. `npm run build` — web 16 라우트, admin 20 라우트 컴파일 성공
3. **SQL 레벨**: 마이그레이션 4개+seed를 로컬 PostgreSQL 16에서 실행 성공, RLS 행동 테스트 **26/26 PASS** (`supabase/tests/`)
4. **브라우저 E2E**: 실제 앱(무수정)을 Playwright로 구동해 **49/49 PASS** (`e2e/`) —
   게스트 차단, 온보딩 전체 플로우, 글 작성→수정→soft delete, 댓글/좋아요/북마크(+DB 카운터),
   모임 링크 게이팅(신규회원 DOM에 URL 부재 → 정회원 승급 후 노출), 검색, 마이페이지,
   자료 제보→관리자 승인→자료실 글 자동 생성→"액트원 운영진" 표기,
   신고→관리자 인정→대상 숨김, 비관리자 /denied → 권한 부여 후 대시보드,
   튜터 수동 지정+manual 로그, 자동 승급 UI 기본 OFF
   - 방법: PostgREST 바이너리를 받을 수 없는 환경이라 `e2e/gateway.mjs`가
     PostgREST+GoTrue 부분집합을 에뮬레이션. 카카오 로그인은 `@supabase/ssr` 실제
     세션 쿠키 주입으로 대체. supabase-js → REST → RLS 경로는 프로덕션과 동일.

---

## 3. 남은 작업 (우선순위 순)

### 3-1. 배포 — 사용자 계정/자격 증명 필요 (코드 작업 아님)

이것이 유일하게 남은 필수 작업입니다. 사용자에게 자격 증명을 요청하세요.

**A. Supabase 프로젝트**
1. supabase.com에서 프로젝트 생성
2. SQL Editor에서 순서대로 실행:
   `supabase/migrations/0001_schema.sql` → `0002_rls.sql` → `0003_post_images.sql` → `supabase/seed.sql`
3. Storage 버킷 `avatars`, `post-images`는 마이그레이션이 생성함(공개 읽기)

**B. 카카오 OAuth**
1. developers.kakao.com에서 앱 생성 → 카카오 로그인 활성화, 동의 항목(닉네임/프로필 이미지/이메일)
2. Kakao Redirect URI에 `https://<project-ref>.supabase.co/auth/v1/callback` 등록
3. Supabase → Authentication → Providers → Kakao에 REST API 키/Secret 입력
4. Supabase URL Configuration:
   - Site URL `https://actone.kr`
   - Redirect URLs: `https://actone.kr/auth/callback`, `https://admin.actone.kr/auth/callback`,
     `http://localhost:3000/auth/callback`, `http://localhost:3001/auth/callback`

**C. Vercel 프로젝트 2개** (모노레포이므로 Root Directory만 다르게)
| 프로젝트 | Root Directory | 도메인 |
|---|---|---|
| actone-web | `apps/web` | actone.kr |
| actone-admin | `apps/admin` | admin.actone.kr |

두 프로젝트 공통 환경 변수 (`.env.example` 참고):
```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=https://actone.kr
NEXT_PUBLIC_ADMIN_SITE_URL=https://admin.actone.kr
```

**D. 최초 관리자 (수동 — UI 없음, 의도된 설계)**
1. 대상 사용자가 actone.kr에 카카오 로그인 1회
2. Supabase SQL:
```sql
update profiles set role = 'admin' where id = '<user-uuid>';
insert into admin_users (user_id, email, is_active) values ('<user-uuid>', '<email>', true);
```
3. 이후 admin.actone.kr 접속 가능. 두 번째 관리자부터는 관리자 사이트 `/admins`에서 추가.

**E. 배포 후 검증 체크리스트** (E2E에서 커버 못 한 Supabase 고유 레이어)
- [ ] 실제 카카오 로그인 → 온보딩 → 커뮤니티 진입
- [ ] `handle_new_user` 트리거로 profiles 자동 생성 + `kakao_id` 값 확인
      (카카오 메타데이터 키가 `provider_id`가 아니면 트리거 수정 — 치명적이진 않음, null만 됨)
- [ ] 아바타/게시글 이미지 실제 업로드 (Storage 정책)
- [ ] `public_profiles`, `offline_meetup_public` 뷰가 PostgREST에서 정상 조회되는지
- [ ] 모임 신청 링크: 신규회원 계정에서 네트워크 탭에 URL이 안 오는지 재확인
- [ ] siteConfig.socialLinks 실제 URL 채우기 (`packages/shared/src/config/site.ts` — 현재 빈 문자열 → "준비 중입니다" 토스트)

### 3-2. 선택 개선 (스펙 내, 낮은 우선순위)

- 글 수정에서 제거한 이미지의 Storage 파일 정리 (현재 DB 참조만 삭제)
- 댓글 수정 기능 (현재 삭제만), 페이지네이션 → 무한 스크롤, OG 이미지
- 관리자 대시보드 기간 필터
- `is_admin()` RLS 함수 성능 모니터링 (트래픽 증가 시)

---

## 4. 핵심 파일 맵 (수정할 때 여기부터)

```
packages/shared/src/
  config/site.ts        # 사업자 정보·소셜 링크 (소셜 URL은 여기만 수정)
  constants/index.ts    # 카테고리 slug·등급·신고 사유·안내 문구 등 모든 도메인 상수
  validation/index.ts   # 모든 zod 스키마 (양쪽 앱 공용)
  lib/supabase/         # env fallback + browser/server 클라이언트 팩토리

apps/web/
  middleware.ts                  # 세션 갱신 + 보호 경로
  lib/data.ts                    # getUserAndProfile(cache) + 조인 헬퍼
  lib/actions/                   # 서버 액션 (auth/posts/engagement/profile/resources)
  app/(public)/ app/(community)/ # (community)/layout.tsx가 온보딩 게이트
  components/post-form.tsx       # 글 작성/수정 공용 폼 (이미지 업로더 포함)

apps/admin/
  lib/admin.ts     # requireAdmin() — 모든 페이지·액션이 호출하는 접근 게이트
  lib/actions.ts   # 관리자 서버 액션 13개 (전부 첫 줄에서 requireAdmin)
  app/(dashboard)/ # 관리자 페이지 전부

supabase/migrations/  # 0001 스키마 / 0002 RLS·뷰·RPC·트리거 / 0003 post_images
supabase/seed.sql     # 카테고리 8개(순서 고정), regular_member_rule(OFF), 샘플 글
supabase/tests/       # SQL 레벨 RLS 테스트 (README에 실행법)
e2e/                  # 브라우저 E2E 하네스 (README에 실행법)
```

---

## 5. 절대 하지 말 것 (스코프 가드 + 깨지기 쉬운 곳)

- **이메일 가입/로그인/비밀번호 재설정**을 어떤 형태로도 추가 금지 (카카오 전용)
- **익명 게시** 금지, **캐스팅/배우DB/AI/결제/DM/알림/팔로우** 등 제외 기능 추가 금지 (`ACTONE_MASTER_SPEC.md` "제외 기능" 참조)
- **카테고리 slug 변경 금지** — `ADMIN_ONLY_CATEGORY_SLUGS`, 모임 로직, RLS 정책이 slug 문자열에 의존
- **`application_url`을 SELECT 가능한 곳에 추가 금지** — 노출 경로는 RPC 하나여야 함
- **튜터 자동 부여 경로 생성 금지** — 수동 전용
- `protect_*` DB 트리거는 `current_user`로 검사 — 새 security definer 함수는 보호 컬럼을 우회할 수 있으니 신중히
- shared 패키지는 `.ts` 소스 그대로 export + Next `transpilePackages` — 빌드 스텝 추가 금지
- env 없이도 빌드되도록 placeholder fallback 있음 (`packages/shared/src/lib/supabase/env.ts`) — 프로덕션에 placeholder로 배포되지 않게 주의

---

## 6. 명령어 모음

```bash
npm install                # 루트에서 1회
npm run dev:web            # localhost:3000
npm run dev:admin          # localhost:3001
npm run lint               # 전체 워크스페이스
npm run build              # 전체 빌드 (web+admin)
npm run build --workspace apps/web
npm run build --workspace apps/admin

# SQL 레벨 RLS 테스트 (로컬 PostgreSQL 16 필요): supabase/tests/README.md
# 브라우저 E2E (로컬 PG + 게이트웨이 + dev 서버): e2e/README.md
```

---

## 7. 문서 인덱스

| 파일 | 내용 |
|---|---|
| `ACTONE_MASTER_SPEC.md` | 제품 스코프 단일 기준 (포함/제외 기능, 카테고리, 인증 플로우) |
| `ACTONE_HANDOFF.md` | 파일 맵, 완료/미검증 상세, 경고 목록 |
| `ACTONE_FEATURE_STATUS.md` | 기능별 체크리스트 + 검증 결과 |
| `ACTONE_TODO_NEXT_MODEL.md` | 남은 작업 상세 + 이미 실행한 명령 기록 |
| `ACTONE_DB_SCHEMA.md` | 테이블/뷰/함수/트리거/시드 전체 |
| `ACTONE_RLS_NOTES.md` | RLS 정책 표, application_url 보호 설계, 알려진 리스크 |
| `ACTONE_ADMIN_SITE_NOTES.md` | 관리자 접근 제어, 페이지/액션 목록 |
| `ACTONE_MEMBER_LEVEL_NOTES.md` | role vs member_level, 등급 규칙, 자동 승급 |
| `README.md` | 설치/Supabase·카카오 설정/배포/최초 관리자 |
| `supabase/tests/README.md`, `e2e/README.md` | 테스트 재실행 절차 |

## 8. 커밋 이력 (이 브랜치)

1. `1ebe668` — 모노레포 전체 + 마이그레이션 2개 + seed + 문서 9개 (128 files)
2. `a9c84ad` — post_images(0003) + 이미지 업로드 + SQL 테스트 하네스(26 PASS) + 문서 갱신
3. `8e2fc63` — 브라우저 E2E 하네스(49/49 PASS) + 문서 갱신
