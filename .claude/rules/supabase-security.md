---
paths:
  - "supabase/**/*.sql"
  - "packages/shared/**/*supabase*.ts"
  - "apps/**/actions/**/*.ts"
  - "apps/**/api/**/*.ts"
---

# Supabase 보안 규칙

- 모든 테이블에 RLS 활성화. 게스트는 커뮤니티 데이터를 읽을 수 없다.
- 오프라인 모임 `application_url`은 `get_meetup_application_url`(security definer RPC)로만 반환.
  뷰/select에 이 컬럼을 추가하면 보안 요구사항 위반이다.
- 사용자는 자신의 `role`, `member_level`, `is_suspended`를 수정할 수 없다
  (`protect_*` 트리거 유지 — 새 security definer 함수가 이를 우회하지 않는지 확인).
- 정지된 사용자는 글/댓글/좋아요/북마크/신고/자료 제보를 만들 수 없다.
- `admin_users`는 관리자만 읽고 관리한다.
- 자료실(`resources`)·공지(`notices`) 글 생성은 관리자 전용. 회원 제보는 승인 후에만 게시.
- service role 키는 서버 전용. 클라이언트 번들에 노출 금지.
- 클라이언트 검사에 의존하지 말고 서버 액션/RLS에서 재검증한다.
