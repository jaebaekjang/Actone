# 로컬 Postgres 마이그레이션/RLS 테스트

실제 Supabase 없이 마이그레이션과 RLS 정책을 로컬 PostgreSQL 16에서 검증하는 하네스.
`00_supabase_stub.sql`이 Supabase 호환 환경(auth 스키마/`auth.uid()`, storage 스텁,
anon/authenticated/service_role 롤)을 만들고, `10_rls_tests.sql`이 실제 사용자
시나리오(게스트/신규회원/정지회원/정회원/관리자)를 시뮬레이션한다.

```bash
createdb actone_test
psql -v ON_ERROR_STOP=1 -d actone_test -f supabase/tests/00_supabase_stub.sql
psql -v ON_ERROR_STOP=1 -d actone_test -f supabase/migrations/0001_schema.sql
psql -v ON_ERROR_STOP=1 -d actone_test -f supabase/migrations/0002_rls.sql
psql -v ON_ERROR_STOP=1 -d actone_test -f supabase/migrations/0003_post_images.sql
psql -v ON_ERROR_STOP=1 -d actone_test -f supabase/seed.sql
psql -d actone_test -f supabase/tests/10_rls_tests.sql 2>&1 | grep -E 'PASS|FAIL'
```

- 모든 출력이 `PASS:`이면 성공. `FAIL:`이 하나라도 있으면 회귀.
- 테스트 파일 안의 `-- EXPECT-ERROR` 주석이 붙은 문장은 **실패해야 정상**이며
  psql이 ERROR를 출력한다 (트리거/RLS가 막는지 확인하는 것).
- 마지막 실행: 2026-07-07, PASS 26 / FAIL 0.

주의: 스텁은 최소 구현이라 Supabase의 GoTrue 동작(토큰 클레임 등)까지 검증하지는
않는다. `set request.jwt.claim.sub to '<uuid>'` + `set role authenticated`로
`auth.uid()`를 흉내낸다.
