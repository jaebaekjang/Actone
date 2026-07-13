---
paths:
  - "**/*.test.{ts,tsx}"
  - "**/*.spec.{ts,tsx}"
  - "playwright/**/*"
  - "e2e/**/*"
  - "supabase/tests/**/*"
---

# 테스트 규칙

- 가장 좁은 검증부터 실행한다: 대상 테스트 → lint → 해당 앱 build → 전체 build.
- RLS 변경 시 `supabase/tests/`(로컬 PostgreSQL 하네스)를 실행한다.
- 화면 플로우 변경 시 `e2e/`(Playwright + 로컬 Supabase 호환 스택)를 실행한다.
- 성공 로그 전체를 붙이지 않는다: 명령어, exit code, 요약만.
- 실패는 실패 파일/라인 + 최소 오류 발췌 + 추정 원인만 보고.
- 같은 오류를 수정 없이 반복 실행하지 않는다.
