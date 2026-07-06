# ACTONE MEMBER LEVEL NOTES

## role vs member_level — 절대 혼용 금지

| 개념 | 컬럼 | 값 | 용도 |
|---|---|---|---|
| 시스템 권한 | `profiles.role` | `member`, `admin` | 관리자 사이트 접근, RLS 관리 권한 |
| 커뮤니티 지위 | `profiles.member_level` | `new_member`, `regular_member`, `tutor` | 배지, 오프라인 모임 링크 접근 |

관리자 접근에는 role='admin' + admin_users.is_active=true가 추가로 필요(ACTONE_ADMIN_SITE_NOTES.md).

## 등급별 권한

### new_member (신규회원)
온보딩 완료 시 기본값(`profiles.member_level` DB default).
가능: 글 읽기/쓰기, 댓글, 좋아요, 북마크, 신고, 자료 제보.
불가: **오프라인 모임 신청 링크 열람** (서버가 URL을 보내지 않음).

### regular_member (정회원)
관리자 수동 지정 또는 (활성화된 경우) 자동 승급.
신규회원 권한 + 모임 신청 링크 열람 + 정회원 전용 모임 참여 + 정회원 배지.

### tutor (튜터)
**관리자 수동 인증 전용. 자동 부여 경로가 코드/DB 어디에도 없음 — 앞으로도 만들지 말 것.**
정회원 권한 전부 + 강조된 골드 튜터 배지(별 아이콘).
튜터 글 자동 고정 금지 — 고정(is_pinned)은 관리자 전용.

## 배지 UI

- `apps/web/components/member-level-badge.tsx` (`MemberLevelBadge`, `AuthorLabel`)
- `apps/admin/components/ui.tsx` (`MemberLevelBadge`)
- 표기: `닉네임 · 신규회원 / 정회원 / 튜터`. 튜터는 골드 필 + Star 아이콘.
- author_id가 null이거나 자료실/공지 글이면 `액트원 운영진 · 운영진` 표시.

## 수동 등급 변경 (관리자 사이트)

`/members/[id]` → "회원 등급 변경" 폼 (`member-level-form.tsx` → `setMemberLevel` 액션, `apps/admin/lib/actions.ts`).

1. `requireAdmin()` 재검증
2. profiles.member_level + member_level_updated_at/by/note 갱신
3. `member_level_logs` insert (change_type='manual', changed_by=관리자, reason)

회원 본인은 자기 member_level을 절대 수정 불가 — `protect_profile_columns` DB 트리거가 차단.

## 자동 정회원 승급

- 설정: `app_settings` key `regular_member_rule`
  `{ enabled, minDaysAfterJoin, minPostCount, minCommentCount, maxReceivedReports }`
- **기본값 enabled=false (seed.sql). 꺼져 있으면 조건 충족해도 절대 승급 안 됨.**
- 관리자 편집: `/settings` (`rule-form.tsx` → `saveRegularMemberRule`)
- 실행 지점: DB 트리거 `maybe_auto_upgrade_member` (posts/comments AFTER INSERT, `0002_rls.sql`)
  - enabled=false → 즉시 return (첫 번째 체크)
  - 대상: member_level='new_member' + 미정지 + 온보딩 완료 + 가입 minDaysAfterJoin일 경과
  - 글 수(삭제 제외) ≥ minPostCount, 댓글 수 ≥ minCommentCount
  - 받은 신고(본인 글/댓글 대상, dismissed 제외) ≤ maxReceivedReports
  - 통과 시: regular_member로 갱신 + `member_level_logs` insert (change_type='automatic')
- **튜터는 자동 승급 대상이 아님** (함수는 regular_member로만 승급).

## member_level_logs

모든 등급 변경 기록: user_id, previous_level, new_level, changed_by(자동이면 null),
change_type('manual'|'automatic'), reason, created_at.
읽기: 본인 + 관리자. 관리자 회원 상세에서 최근 20건 표시.
