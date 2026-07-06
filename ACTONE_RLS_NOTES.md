# ACTONE RLS NOTES

RLS 정의: `supabase/migrations/0002_rls.sql`. 모든 테이블에 RLS 활성화됨.

## 보안 모델 요약

1. **게스트(anon)는 커뮤니티 데이터를 전혀 읽을 수 없다.** 모든 정책이 `to authenticated`이고 뷰/RPC도 anon에서 revoke됨.
2. **"관리자" = `profiles.role='admin'` AND `admin_users.is_active=true`.** `is_admin()` security definer 함수가 이 정의를 캡슐화. UI 숨김이 아니라 DB가 강제.
3. **정지 회원**은 읽기는 가능하나 쓰기(글/댓글/좋아요/북마크/신고/제보) 불가 — insert 정책의 `is_active_member()` 조건.
4. **회원은 자신의 role/member_level/is_suspended를 절대 바꿀 수 없다.** UPDATE 정책으로 자기 행 수정은 허용하되, `protect_profile_columns` 트리거가 보호 컬럼 변경을 차단(비관리자 + authenticated 역할일 때).
5. 카운터(view/like/comment/bookmark count)와 is_pinned도 같은 방식으로 트리거 차단. 카운터는 security definer 트리거만 갱신.

## 핵심: offline_meetup_details.application_url

**비인가 클라이언트에는 URL이 서버에서 아예 전송되지 않는다.**

- 기본 테이블 SELECT 정책: 관리자 또는 **글 작성자 본인**만 (작성자는 자기가 넣은 URL을 수정 화면에서 봐야 함).
- 일반 회원 읽기 경로는 `offline_meetup_public` 뷰뿐 — 이 뷰에는 `application_url` 컬럼이 존재하지 않고 `has_application_url` boolean만 있음.
- URL 획득 유일 경로: `get_meetup_application_url(p_post_id)` RPC (security definer).
  - 반환 조건: `is_admin()` 이거나, 호출자가 **정지되지 않은** `regular_member`/`tutor`.
  - 그 외(new_member, 정지 회원)는 null.
- 웹 UI(`apps/web/app/(community)/posts/[postId]/page.tsx`)는 URL이 null이면 안내 문구만 렌더:
  - 신규회원: "오프라인 모임 신청 링크는 정회원부터 확인할 수 있습니다."
  - 정지 회원: "현재 계정 상태에서는 오프라인 모임 신청 링크를 확인할 수 없습니다."

## 테이블별 정책 요약

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | 본인 전체 / 관리자 전체. 타인은 `public_profiles` 뷰(닉네임/아바타/등급만) | 본인 행만(callback fallback) | 본인(보호컬럼 트리거 차단) / 관리자 | - |
| admin_users | 관리자만 | 관리자만 | 관리자만 | 관리자만 |
| categories | 인증 사용자(활성만), 관리자는 비활성 포함 | 관리자 | 관리자 | 관리자 |
| posts | 인증: published + 자기 글 + 관리자 전체 | 본인 author_id + 미정지 + resources/notices는 관리자만 + is_pinned는 관리자만 | 작성자(published/deleted만) / 관리자 | - (soft delete) |
| offline_meetup_details | 관리자 / 글 작성자 | 글 작성자(미정지) | 글 작성자 / 관리자 | 관리자 |
| comments | 인증: published + 자기 것 + 관리자 | 본인 + 미정지 | 작성자(published/deleted만) / 관리자 | - |
| post_likes / bookmarks | 본인 것 / 관리자 | 본인 + 미정지 (unique 제약으로 중복 방지) | - | 본인 것 |
| reports | 신고자 본인 / 관리자 | 본인 + 미정지 + status=pending | 관리자만 | - |
| resource_submissions | 제출자 본인 / 관리자 | 본인 + 미정지 + status=pending | 관리자만 | - |
| member_level_logs | 본인 이력 / 관리자 | 관리자 (자동 승급은 definer 함수가 owner 권한으로 insert) | - | - |
| app_settings | 관리자만 | 관리자만 | 관리자만 | 관리자만 |
| storage.objects (avatars) | 인증 사용자 읽기(버킷은 public) | 본인 폴더(`{uid}/...`)만 | 본인 폴더 | 본인 폴더 |

## 트리거 우회 메커니즘 (알아둘 것)

`protect_*` 트리거는 `current_user in ('authenticated','anon')`일 때만 검사한다.
security definer 함수(owner=postgres)나 service_role 접속은 `current_user`가 다르므로 통과 —
카운터 트리거, 자동 승급, `increment_view_count`가 이 경로로 동작한다.
**새 security definer 함수를 추가할 때는 이 함수가 보호 컬럼을 마음대로 바꿀 수 있다는 점을 인지하고 작성할 것.**

## 알려진 리스크 / 주의사항

- `posts.author_id`가 null인 시드 글은 "액트원 운영진"으로 표시됨. author null 글은 아무도 수정 권한이 없음(관리자 제외) — 의도된 동작.
- 검색은 사용자 입력을 `ilike` 패턴에 넣기 전에 `,`와 `%`를 제거함(PostgREST or() 파싱/와일드카드 주입 방지). 새 검색 코드를 추가하면 동일하게 처리할 것.
- `is_admin()`은 요청마다 profiles+admin_users 서브쿼리를 실행. 트래픽이 커지면 성능 검토 필요.
- RLS는 **실제 Supabase 인스턴스에서 아직 통합 테스트되지 않음**. 적용 후 ACTONE_TODO_NEXT_MODEL.md의 검증 시나리오를 실행할 것.
- 관리자 사이트는 anon key + 사용자 세션으로 동작(서비스 롤 키 불필요). 관리자 권한은 전적으로 RLS의 `is_admin()`이 부여 — admin_users를 비활성화하면 DB 수준에서 즉시 권한이 사라짐.
