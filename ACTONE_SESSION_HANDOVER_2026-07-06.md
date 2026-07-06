# 액트원 세션 인수인계서 (2026-07-06)

다른 프로젝트/세션/모델이 이 작업을 이어받기 위한 문서.
**읽는 순서: 이 문서 → `ACTONE_MASTER_SPEC.md` → `ACTONE_TODO_NEXT_MODEL.md`**, 세부는 각 노트 문서 참고.

---

## 1. 프로젝트 한 줄 요약

액트원(Act One) — 인맥 없이 배우를 시작한 사람들을 위한 한국어 커뮤니티 웹사이트.
커뮤니티 **전용**(캐스팅/매칭/AI/유료 금지). 카카오 로그인 전용. 모바일 퍼스트, 다크 극장 무드.

- 스택: Next.js 15 App Router · TypeScript · Tailwind v4 · Supabase (Auth/PG/Storage/RLS) · RHF+zod
- 구조: npm workspaces monorepo — `apps/web`(사용자, actone.kr) / `apps/admin`(관리자, admin.actone.kr) / `packages/shared`
- 배포 대상: Vercel 2개 프로젝트 + Supabase 1개 프로젝트

## 2. Git 상태 (2026-07-06 기준)

- 리포: `jaebaekjang/Actone` (GitHub)
- 기본 브랜치: `claude/act-one-community-mvp-oqqf0u` — 최초 MVP 전체 (`1ebe668`)
- **작업 브랜치: `claude/markdown-file-recognition-92as9b`** ← 최신. 여기서 이어서 작업할 것
  - `758e3cb` post_images(게시글 이미지 업로드) + 검색 결과 meetup 정보 표시 + 문서 갱신
  - `4cf628d` 앱별 `.env.example` 추가 (스펙 §29)
- PR 미생성 상태. 기본 브랜치로 머지하려면 PR을 만들거나 직접 머지 필요.
- 워킹트리 클린, 전부 푸시됨.

## 3. 구현 상태 요약

**스펙 범위 내 미구현 기능: 0건.** (선택 기능이던 post_images까지 완료)

| 영역 | 상태 |
|---|---|
| 사용자 사이트 전체 (랜딩~커뮤니티 CRUD/검색/마이페이지/제보) | ✅ 구현 + 빌드 통과 |
| 게시글 이미지 업로드 (최대 5장, jpg/png/webp, 각 5MB) | ✅ 이번 세션 구현 |
| 관리자 사이트 전체 (대시보드~관리자 계정, 이중 접근 조건) | ✅ 구현 + 빌드 통과 |
| DB: 마이그레이션 3개 + seed (테이블 13, 뷰 2, RPC/트리거) | ✅ 파일 작성 완료 |
| RLS 전 테이블 + 보호 트리거 + application_url 서버측 차단 | ✅ 파일 작성 완료 |
| `npm run lint` / `npm run build` | ✅ 통과 (에러/경고 0, web 16 + admin 20 라우트) |
| **Supabase 실인스턴스 적용/검증** | ❌ **0% — 최우선 남은 작업** |
| Vercel 배포 + 도메인 연결 | ❌ 미실시 |
| 카카오 OAuth 실연동 | ❌ 미실시 |

렌더링 자체는 로컬 dev 서버 + Playwright로 확인됨(공개 페이지 4종 정상, 모바일 390px 오버플로우 없음).

## 4. 다음 세션이 해야 할 일 (우선순위 순)

### 4-1. Supabase 실인스턴스 적용 + 검증 (최우선, 사용자 자격 증명 필요)

1. Supabase 프로젝트 생성 → SQL Editor에서 순서대로 실행:
   `supabase/migrations/0001_schema.sql` → `0002_rls.sql` → `0003_post_images.sql` → `supabase/seed.sql`
2. 카카오 OAuth 연결 (README "카카오 OAuth 설정" 절차 그대로)
3. `apps/web/.env.local`, `apps/admin/.env.local` 생성 (각 디렉터리의 `.env.example` 복사)
4. `ACTONE_TODO_NEXT_MODEL.md` §1의 체크리스트 시나리오 전부 수동 검증
   (온보딩 플로우, CRUD, 카운터, 모임 링크 게이트, 게스트 차단, 정지 계정, 관리자 기능, 자동 승급 ON/OFF, **이미지 업로드**)
5. 검증 중 버그 예상 지점: `ACTONE_TODO_NEXT_MODEL.md` §2 (handle_new_user 메타데이터 키, 뷰 grant, 검색 특수문자, 카카오 CDN 도메인)

### 4-2. 배포

- Vercel 프로젝트 2개: Root Directory = `apps/web` / `apps/admin`, README 표 참고
- 도메인: actone.kr / admin.actone.kr, Supabase Auth Redirect URL에 프로덕션 콜백 2개 등록
- `packages/shared/src/config/site.ts`의 `socialLinks` 실제 URL 채우기 (현재 빈 문자열 → "준비 중입니다" 토스트)

### 4-3. 최초 관리자 설정 (수동, UI 없음 — 의도됨)

README "최초 관리자 설정": 사용자 사이트 카카오 로그인 후 SQL로
`profiles.role='admin'` + `admin_users` insert (`is_active=true`). 둘 다 충족해야 관리자 사이트 접근 가능.

## 5. 이번 세션에서 변경된 파일 (커밋 758e3cb, 4cf628d)

```
supabase/migrations/0003_post_images.sql   # 신규: post_images 테이블/5장 제한 트리거/RLS/post-images 버킷
packages/shared/src/types/index.ts          # PostImage 타입
packages/shared/src/validation/index.ts     # postSchema.image_urls
packages/shared/src/constants/index.ts      # POST_IMAGE_MAX_COUNT, IMAGE_MAX_SIZE, IMAGE_ALLOWED_TYPES
apps/web/components/post-form.tsx           # 이미지 선택/업로드/미리보기/삭제 UI
apps/web/lib/actions/posts.ts               # 본인 폴더 URL만 수용 + post_images 행 교체
apps/web/app/(community)/posts/[postId]/page.tsx  # 본문 아래 이미지 렌더
apps/web/app/(community)/edit/[postId]/page.tsx   # 기존 이미지 로드
apps/web/app/(community)/search/page.tsx    # 검색 결과 모임 카드에 meetup 정보
apps/web/.env.example, apps/admin/.env.example    # 신규
ACTONE_*.md, README.md                      # 새 상태 반영 갱신
```

이미지 업로드 흐름: 브라우저에서 `post-images` 버킷 `{userId}/...` 경로로 직접 업로드 →
서버 액션에 public URL 전달 → 서버는 `/storage/v1/object/public/post-images/{userId}/` 프리픽스 URL만 수용
(외부 URL 주입 차단) → post_images 행 교체(delete+insert). 글/이미지 삭제 시 storage 원본은 남음(orphan, 허용된 한계).

## 6. 절대 하지 말 것 (보안/스코프 — 상세: ACTONE_HANDOFF.md, ACTONE_RLS_NOTES.md)

1. **카테고리 slug 변경 금지** — `ADMIN_ONLY_CATEGORY_SLUGS`, 모임 로직, RLS가 slug 문자열에 의존
2. **`application_url`을 select/뷰에 추가 금지** — 노출 경로는 `get_meetup_application_url` RPC 하나뿐이어야 함
3. 이메일 로그인/익명 게시/스펙 §30 제외 기능 어떤 형태로도 추가 금지
4. 튜터 자동 부여 경로 만들지 말 것 (수동 전용)
5. `protect_*` 트리거는 `current_user`로 검사 — 새 security definer 함수는 보호 컬럼을 우회 가능하니 신중히
6. shared 패키지에 빌드 스텝 추가 금지 (`transpilePackages`로 컴파일됨)
7. `NEXT_PUBLIC_*` placeholder fallback이 있음 — 프로덕션에 placeholder로 배포되지 않게 주의

## 7. 문서 지도

| 문서 | 내용 |
|---|---|
| `ACTONE_MASTER_SPEC.md` | 제품 범위 단일 기준. 코드와 충돌 시 이 문서 우선 |
| `ACTONE_HANDOFF.md` | 완료/미검증 목록, 핵심 파일 경로, 경고 |
| `ACTONE_FEATURE_STATUS.md` | 기능별 체크리스트 |
| `ACTONE_TODO_NEXT_MODEL.md` | **다음 작업 상세 + 검증 시나리오** |
| `ACTONE_DB_SCHEMA.md` | 테이블 13/뷰/RPC/트리거/Storage/시드 |
| `ACTONE_RLS_NOTES.md` | 보안 모델, 정책 표, 트리거 우회 메커니즘, 리스크 |
| `ACTONE_ADMIN_SITE_NOTES.md` | 관리자 접근 제어/페이지/액션 |
| `ACTONE_MEMBER_LEVEL_NOTES.md` | role vs member_level, 등급 규칙, 자동 승급 |
| `README.md` | 셋업/환경변수/카카오 OAuth/배포/최초 관리자 |

## 8. 빠른 시작 (새 환경에서)

```bash
git clone <repo> && cd Actone
git checkout claude/markdown-file-recognition-92as9b
npm install
npm run lint && npm run build      # 그린 확인 (2026-07-06 통과 상태)
npm run dev:web                    # localhost:3000 (Supabase 없이도 공개 페이지 렌더됨)
npm run dev:admin                  # localhost:3001
```

## 9. 사용자에게 받아야 할 것

- [ ] Supabase 프로젝트 URL + anon key (또는 사용자가 직접 마이그레이션 실행)
- [ ] 카카오 개발자 앱 REST API 키/Client Secret (Supabase 카카오 Provider 설정용)
- [ ] Vercel 배포 승인 + 도메인(actone.kr) DNS 설정
- [ ] 소셜 링크 5종 실제 URL (인스타그램/카카오채널/스레드/틱톡/유튜브)
- [ ] 작업 브랜치의 기본 브랜치 머지(PR) 여부 결정
