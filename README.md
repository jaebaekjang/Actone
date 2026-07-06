# 액트원 (Act One)

인맥 없이 배우를 시작한 사람들을 위한 한국어 배우 커뮤니티.

> "인맥 없이 배우를 시작했다면, 혼자 버티지 않아도 됩니다."

커뮤니티 전용 서비스입니다. 캐스팅 플랫폼, 배우 DB 검색, AI 추천, 유료 구독, B2B 기능은 **의도적으로 포함하지 않습니다**.

## 구조 (monorepo)

```
apps/
  web/      # 사용자 커뮤니티 사이트 → https://actone.kr
  admin/    # 분리된 관리자 사이트   → https://admin.actone.kr
packages/
  shared/   # 공용 타입, 상수, 설정(siteConfig), zod 검증, Supabase 클라이언트 헬퍼
supabase/
  migrations/  # 0001_schema.sql, 0002_rls.sql
  seed.sql     # 8개 카테고리, 자동 승급 규칙(OFF), 샘플 글
```

- 사용자 사이트에는 `/admin` 경로가 **없습니다**. 관리자 기능은 전부 `apps/admin`에 있습니다.
- 도메인 로직 상수(카테고리 slug, 회원 등급, 신고 사유 등)는 `packages/shared/src/constants`에서만 관리합니다.

## 기술 스택

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · React Hook Form · Zod · Supabase (Auth / PostgreSQL / Storage / RLS) · 배포: Vercel + Supabase

## 환경 변수

루트 `.env.example` 참고. 각 앱 디렉터리(`apps/web`, `apps/admin`)에 `.env.local`로 넣으세요.

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon key
SUPABASE_SERVICE_ROLE_KEY=       # (선택) 현재 코드는 사용하지 않음. RLS로 권한 처리
NEXT_PUBLIC_SITE_URL=https://actone.kr
NEXT_PUBLIC_ADMIN_SITE_URL=https://admin.actone.kr
```

환경 변수가 없어도 빌드는 통과하도록 placeholder fallback이 있습니다
(`packages/shared/src/lib/supabase/env.ts`). 런타임에는 실제 값이 필요합니다.

## Supabase 설정

1. Supabase 프로젝트 생성.
2. SQL Editor에서 순서대로 실행:
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/seed.sql`
   (또는 Supabase CLI: `supabase db push` 후 `supabase db seed`)
3. Storage에 `avatars` 버킷은 0002 마이그레이션이 생성합니다(공개 읽기).

## 카카오 OAuth 설정

1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성 → 카카오 로그인 활성화.
2. 동의 항목: 닉네임/프로필 이미지(선택), 이메일(가능하면).
3. Supabase Dashboard → Authentication → Providers → Kakao 활성화, REST API 키/Client Secret 입력.
4. Kakao Redirect URI에 Supabase callback 추가:
   `https://<project-ref>.supabase.co/auth/v1/callback`
5. Supabase → Authentication → URL Configuration:
   - Site URL: `https://actone.kr`
   - Redirect URLs: `https://actone.kr/auth/callback`, `https://admin.actone.kr/auth/callback`,
     로컬 개발용 `http://localhost:3000/auth/callback`, `http://localhost:3001/auth/callback`

이메일 회원가입/로그인/비밀번호 재설정은 **지원하지 않습니다** (카카오 로그인 전용).

## 로컬 개발

```bash
npm install
npm run dev:web    # http://localhost:3000
npm run dev:admin  # http://localhost:3001
```

## 빌드 / 린트

```bash
npm run lint    # 모든 workspace lint
npm run build   # 모든 workspace 빌드
npm run build --workspace apps/web
npm run build --workspace apps/admin
```

## 배포 (Vercel)

앱마다 Vercel 프로젝트를 하나씩 만듭니다.

| 프로젝트 | Root Directory | 도메인 |
|---|---|---|
| actone-web | `apps/web` | actone.kr |
| actone-admin | `apps/admin` | admin.actone.kr |

두 프로젝트 모두 위 환경 변수를 설정하세요. monorepo이므로 Vercel이 루트 `package.json` workspaces를 자동 인식합니다.

## 최초 관리자 설정 (수동)

관리자 생성 UI는 의도적으로 없습니다. Supabase 대시보드에서:

1. 대상 사용자가 먼저 **사용자 사이트**(actone.kr)에 카카오 로그인.
2. `profiles`에서 해당 유저 행 확인 후:

```sql
update profiles set role = 'admin' where id = '<user-uuid>';
insert into admin_users (user_id, email, is_active)
values ('<user-uuid>', '<email-or-null>', true);
```

3. 이후 `admin.actone.kr`에 카카오 로그인하면 접근 가능.
   접근 조건은 **둘 다** 필요: `profiles.role = 'admin'` **그리고** `admin_users.is_active = true`.
   두 번째 관리자부터는 관리자 사이트의 "관리자 계정" 메뉴에서 이메일로 추가할 수 있습니다.

## 의도적으로 제외된 기능

이메일 가입/로그인/비밀번호 재설정, 익명 게시, 프로필 피드백 게시판, 배우 DB,
제작사 계정, 캐스팅 매칭, AI 추천/평가, 결제/유료 구독, DM/채팅, 알림,
팔로우, 외부 오디션 크롤링, 모바일 앱, B2B 대시보드, 강의.

## 알려진 한계

- 게시글 이미지 업로드(post_images)는 미구현(스키마 상 선택 항목). 아바타 업로드는 구현됨.
- 댓글 대댓글 없음(MVP 스펙).
- 페이지네이션은 단순 페이지 번호 방식(카테고리 보드), 검색은 ilike 기반.
- 실제 Supabase 프로젝트에 대해 E2E 검증은 하지 않음(마이그레이션은 코드 리뷰 수준으로 검증). `ACTONE_TODO_NEXT_MODEL.md` 참고.

## 핸드오프 문서

`ACTONE_MASTER_SPEC.md`, `ACTONE_HANDOFF.md`, `ACTONE_FEATURE_STATUS.md`,
`ACTONE_TODO_NEXT_MODEL.md`, `ACTONE_DB_SCHEMA.md`, `ACTONE_RLS_NOTES.md`,
`ACTONE_ADMIN_SITE_NOTES.md`, `ACTONE_MEMBER_LEVEL_NOTES.md`
