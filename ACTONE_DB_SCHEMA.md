# ACTONE DB SCHEMA

마이그레이션: `supabase/migrations/0001_schema.sql` (테이블/인덱스/트리거), `supabase/migrations/0002_rls.sql` (RLS/뷰/RPC), 시드: `supabase/seed.sql`.

## 테이블

### profiles (auth.users 1:1)
`id uuid PK → auth.users`, `kakao_id`, `email`, `nickname unique`, `avatar_url`,
`actor_status`, `activity_field`, `region`, `expectation text[]`, `bio`,
`role` ('member'|'admin', default member), `member_level` ('new_member'|'regular_member'|'tutor', default new_member),
`is_suspended bool default false`, `onboarding_completed bool default false`,
`member_level_updated_at/by/note`, `created_at`, `updated_at`.

### admin_users
`id`, `user_id → profiles (unique)`, `email`, `is_active default true`, `created_by`, timestamps.
관리자 사이트 접근의 두 번째 조건. profiles.role='admin'과 함께 모두 충족해야 함.

### categories
`id`, `name`, `slug unique`, `description`, `sort_order`, `is_active`, timestamps.

### posts
`id`, `category_id → categories`, `author_id → profiles (nullable — 시드/운영진 글)`,
`title`, `content`, `excerpt`, `tags text[]`, `is_pinned`,
`status` ('published'|'hidden'|'deleted'), 카운터: `view_count`, `like_count`, `comment_count`, `bookmark_count`, timestamps.
카운터는 트리거가 유지(클라이언트 수정 불가). 익명 필드 없음.
인덱스: (category_id,status,created_at), (author_id), (status,created_at), tags GIN.

### offline_meetup_details
`id`, `post_id → posts (unique, cascade)`, `region`, `meetup_date date`, `meetup_time time`,
`venue`, `capacity int`, `fee`, `application_url` (**민감**), `is_regular_member_only default true`, timestamps.
application_url은 일반 select로 노출되지 않음 — ACTONE_RLS_NOTES.md 참고.

### comments (대댓글 없음)
`id`, `post_id (cascade)`, `author_id`, `content`, `status` (published/hidden/deleted), timestamps.

### post_likes / bookmarks
`id`, `post_id (cascade)`, `user_id (cascade)`, `created_at`, **unique(post_id,user_id)** — 중복 방지.

### reports
`id`, `reporter_id`, `target_type` ('post'|'comment'), `target_id uuid`, `reason`, `detail`,
`status` ('pending'|'resolved'|'dismissed'), `admin_note`, `created_at`, `resolved_at`.
신고 사유 목록은 `packages/shared/src/constants` `REPORT_REASONS`.

### resource_submissions
`id`, `submitter_id (cascade)`, `title`, `content`, `source_url`, `submission_reason`,
`status` ('pending'|'approved'|'rejected'), `admin_note`, `reviewed_by`, `reviewed_at`, timestamps.

### member_level_logs
`id`, `user_id (cascade)`, `previous_level`, `new_level`, `changed_by`,
`change_type` ('manual'|'automatic'), `reason`, `created_at`.

### app_settings
`id`, `key unique`, `value jsonb`, timestamps.
키 `regular_member_rule` = `{"enabled":false,"minDaysAfterJoin":7,"minPostCount":1,"minCommentCount":3,"maxReceivedReports":0}` (시드에서 삽입, 기본 OFF).

### post_images
**미구현** (스펙상 선택). 필요 시 posts에 cascade FK + image_url + sort_order로 추가.

## 뷰

- `public_profiles`: profiles의 공개 필드만(id, nickname, avatar_url, member_level, is_suspended). 다른 회원 프로필 표시용.
- `offline_meetup_public`: meetup 안전 필드 + `has_application_url` boolean. **application_url 컬럼 자체가 없음**.

둘 다 owner(postgres) 권한으로 동작, `anon` revoke / `authenticated`만 grant.

## 함수 / 트리거

| 이름 | 종류 | 역할 |
|---|---|---|
| `handle_new_user` | auth.users AFTER INSERT | profiles 자동 생성 |
| `set_updated_at` | BEFORE UPDATE (updated_at 있는 테이블 전부) | updated_at 갱신 |
| `refresh_post_comment_count/like_count/bookmark_count` | comments/post_likes/bookmarks 트리거 | posts 카운터 재계산 (security definer) |
| `protect_profile_columns` | profiles BEFORE UPDATE | 비관리자의 role/member_level/is_suspended 등 변경 차단 |
| `protect_post_columns` | posts BEFORE UPDATE | 비관리자의 is_pinned/카운터/hidden 상태 변경 차단 (published↔deleted만 허용) |
| `protect_comment_columns` | comments BEFORE UPDATE | 동일 개념 |
| `is_admin(uid)` / `is_active_member(uid)` / `current_member_level(uid)` | RLS 헬퍼 (security definer) | 정책에서 사용 |
| `get_meetup_application_url(p_post_id)` | RPC (security definer) | 정회원/튜터/관리자에게만 URL 반환, 그 외 null |
| `increment_view_count(p_post_id)` | RPC (security definer) | 조회수 +1 (published 글만) |
| `maybe_auto_upgrade_member` | posts/comments AFTER INSERT | 자동 정회원 승급 (rule.enabled=false면 즉시 리턴) |

## Storage

`avatars` 버킷(공개 읽기). 경로 `{userId}/...`에만 본인 업로드/수정/삭제 허용.

## 시드 데이터 (supabase/seed.sql)

- 8개 카테고리(위 순서, on conflict do nothing)
- `regular_member_rule` (enabled=false)
- 샘플 글 6개(공지 1: is_pinned=true, 오프라인 모임 1(+meetup details, URL 없음), 생존방/스터디/오디션/후기 각 1). 모두 `author_id=null` → UI에서 "액트원 운영진" 표시.

## 마이그레이션 상태

파일은 작성 완료. **실제 Supabase 프로젝트에는 아직 적용되지 않음** (이 리포에는 Supabase 자격 증명이 없음). SQL Editor 또는 supabase CLI로 0001 → 0002 → seed 순서로 적용할 것.
