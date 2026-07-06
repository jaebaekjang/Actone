# ACTONE ADMIN SITE NOTES

## 위치 / 배포

- 앱 경로: `apps/admin` (사용자 사이트와 완전히 분리된 Next.js 앱)
- 배포 대상: `https://admin.actone.kr` (Vercel 별도 프로젝트, Root Directory = `apps/admin`)
- 사용자 사이트(`apps/web`)에는 `/admin` 라우트도, 관리자 내비게이션도 존재하지 않음.

## 인증 / 접근 제어

로그인 수단: 카카오(Supabase Auth)만. `/login` → `signInWithOAuth({provider:'kakao'})` → `/auth/callback`.

접근 조건 (**모두** 충족해야 함):
1. Supabase 세션 존재 (middleware가 미로그인 → `/login` 리다이렉트)
2. `profiles.role = 'admin'`
3. `admin_users`에 `is_active = true` 행 존재

검증 지점 (숨김 UI에 의존하지 않음):
- `apps/admin/lib/admin.ts` `requireAdmin()` — 조건 2,3 확인, 실패 시 `redirect('/denied')`
- `(dashboard)/layout.tsx`가 모든 관리자 페이지 렌더 전에 호출
- **모든 서버 액션**(`apps/admin/lib/actions.ts`)이 각자 `requireAdmin()`을 다시 호출
- 마지막 방어선: DB RLS의 `is_admin()` — 앱이 뚫려도 DB가 거부

`/denied`: "접근 권한이 없습니다. 관리자에게 문의해주세요." + 로그아웃 버튼.

## 페이지 목록

| 경로 | 기능 |
|---|---|
| `/` | 대시보드: 전체/오늘 회원 수, 전체/오늘 글 수, 대기 신고/제보 수, 최근 신고/글 |
| `/members` | 회원 목록, 닉네임/이메일 검색, role·등급·정지 상태 표시 |
| `/members/[id]` | 회원 상세: 프로필, 글/댓글/받은 신고 수, 등급 수동 변경(사유 입력), 정지/해제, 등급 변경 이력 |
| `/settings` | 정회원 자동 승급 규칙 편집 (enabled 기본 OFF, minDaysAfterJoin, minPostCount, minCommentCount, maxReceivedReports) |
| `/posts` | 게시글 목록: 검색, 카테고리/상태 필터, 숨김/복구/삭제/고정 |
| `/posts/[id]` | 게시글 내용 열람 + 상태 변경 |
| `/comments` | 댓글 목록: 검색, 상태 필터, 숨김/복구/삭제 |
| `/reports` | 신고 목록(상태 필터) |
| `/reports/[id]` | 신고 상세: 대상 글/댓글 내용 표시, 인정(resolve)/기각(dismiss), 관리자 메모, 대상 숨김 처리 옵션 |
| `/submissions` | 자료 제보 목록(상태 필터) |
| `/submissions/[id]` | 제보 상세: 승인(→ 자료실에 운영진 명의 글 자동 생성) / 반려(+메모 저장) |
| `/notices` | 공지 목록: 작성/수정/고정/숨김 (공지 = notices 카테고리의 posts) |
| `/notices/new`, `/notices/[id]` | 공지 작성/수정 폼 |
| `/categories` | 카테고리 이름/설명/정렬/활성화 편집 (slug는 편집 불가 — 시스템 로직에 사용) |
| `/admins` | admin_users 목록(연결 프로필/이메일 표시), 활성/비활성 토글(본인 비활성화 차단), 이메일로 관리자 추가 |

## 서버 액션 (apps/admin/lib/actions.ts)

`signOut`, `setMemberLevel`, `setSuspension`, `saveRegularMemberRule`,
`setPostStatus`, `setPostPinned`, `setCommentStatus`, `resolveReport`,
`reviewSubmission`, `saveNotice`, `updateCategory`, `toggleAdminActive`, `addAdminByEmail`.
전부 첫 줄에서 `requireAdmin()` 호출.

## 자료 제보 승인 동작

`reviewSubmission(approved)`:
1. resources 카테고리 id 조회
2. posts insert (author_id = 검토 관리자; source_url 있으면 본문 하단에 "출처:" 첨부)
3. submission status='approved', reviewed_by/at 기록
사용자 사이트는 resources/notices 카테고리 글의 작성자를 항상 "액트원 운영진"으로 표시.
반려 시 status='rejected' + admin_note 저장. 회원 제보가 승인 없이 게시되는 경로는 없음.

## 최초 관리자 (수동 — UI 없음, 의도됨)

README "최초 관리자 설정" 참고. 요약: 사용자 사이트 카카오 로그인 → SQL로
`profiles.role='admin'` + `admin_users` insert. 이후 두 번째 관리자부터는 `/admins`에서 추가 가능.

## 구현 노트

- 관리자 앱도 anon key + 사용자 세션으로 Supabase에 접근. 서비스 롤 키 불필요(권한은 RLS `is_admin()`이 부여).
- `requireAdmin()`은 React `cache()`로 요청당 1회만 실행.
- robots: noindex (root layout metadata).
