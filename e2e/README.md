# 액트원 로컬 E2E 하네스

실제 Supabase/카카오 계정 없이, **수정 없는 실제 Next.js 앱**을 브라우저(Playwright)로
구동해 검증하는 하네스. 로컬 PostgreSQL 앞에 Supabase 호환 게이트웨이를 세워
supabase-js → REST → RLS SQL 경로를 그대로 태운다.

마지막 실행: 2026-07-07 — **49/49 PASS** (스크린샷 14장 생성).

## 구성

| 파일 | 역할 |
|---|---|
| `01_stub_postgrest.sql` | auth 스키마/`auth.uid()`(PostgREST `request.jwt.claims` 호환), storage 스텁, anon/authenticated/authenticator 롤 |
| `gateway.mjs` | :54321에서 PostgREST 부분집합(`/rest/v1/*`: 필터·정렬·range·count·insert·update·delete·upsert·rpc)과 GoTrue 부분집합(`/auth/v1/user`, token refresh, logout), 세션 발급 헬퍼(`/e2e/mint`) 제공 |
| `mint-cookies.mjs` | `@supabase/ssr`로 실제 세션 쿠키(`sb-localhost-auth-token`)를 생성 — 카카오 로그인 단계를 대체 |
| `e2e.mjs` | Playwright 시나리오 49건 (아래) |

## 실행 방법

```bash
# 1. 로컬 PostgreSQL 기동(예: 55432), DB 생성 후 순서대로 적용
createdb actone_e2e
psql -d actone_e2e -f e2e/01_stub_postgrest.sql
psql -d actone_e2e -f supabase/migrations/0001_schema.sql
psql -d actone_e2e -f supabase/migrations/0002_rls.sql
psql -d actone_e2e -f supabase/migrations/0003_post_images.sql
psql -d actone_e2e -f supabase/seed.sql
# Supabase 기본 grant 에뮬레이션 (supabase/tests/README.md 참고와 동일)
psql -d actone_e2e -c "grant all on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
revoke select on public.public_profiles, public.offline_meetup_public from anon;
revoke execute on function public.get_meetup_application_url(uuid) from anon;
revoke execute on function public.increment_view_count(uuid) from anon;"

# 2. 게이트웨이
cd e2e && npm install && node gateway.mjs &   # ANON_KEY 출력됨

# 3. 앱 env (.env.local, 두 앱 모두)
#    NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=<게이트웨이가 출력한 ANON_KEY>
npm run dev:web & npm run dev:admin &

# 4. 실행
node e2e.mjs
```

환경 변수: `E2E_PGHOST/E2E_PGPORT/E2E_PGDATABASE`(게이트웨이),
`E2E_PGADMIN_HOST/E2E_PGADMIN_USER`(테스트의 관리 SQL), `E2E_CHROMIUM`, `E2E_SHOTS_DIR`.

## 검증 시나리오 (49건)

- 게스트: 랜딩/푸터 렌더, /community → /login 리다이렉트, 로그인 페이지에 이메일/비밀번호 입력 없음
- 온보딩: 미완료 게이트, 폼 제출 → /community, 프로필 저장(new_member 기본)
- 커뮤니티 홈: 고정 공지, 오늘의 질문, 카테고리 카드
- 글: 작성 → 상세 리다이렉트, 작성자+등급 배지, 수정 반영, soft delete(status=deleted)
- 댓글/좋아요/북마크: UI 반영 + DB 카운터 트리거 검증
- 모임 링크 게이팅: 신규회원은 안내 문구 + **URL이 DOM에 없음**, 정회원 승급 후 버튼+정확한 href
- 검색, 마이페이지(탭/배지)
- 자료 제보 → 접수 문구 → 관리자 승인 → 자료실 글 자동 생성 → 웹에서 "액트원 운영진" 표시
- 신고 → 관리자 인정+대상 숨김(DB 확인)
- 관리자: 비관리자 /denied, 부여 후 대시보드/회원 목록, 튜터 수동 지정 + manual 로그, 자동 승급 기본 OFF UI

## 한계

- 카카오 OAuth 자체(외부 리다이렉트)와 Storage 업로드는 에뮬레이션하지 않음.
- 게이트웨이는 이 앱이 실제로 사용하는 PostgREST 기능 부분집합만 구현 — 새 쿼리 패턴(임베딩 등)을 추가하면 게이트웨이도 갱신 필요.
