# ACT ONE 슈퍼어드민 구현 진행 상황

Manus 스펙(`pasted_content.txt` 30개 섹션)을 **현재 Next.js + Supabase 저장소** 위에
단계적으로 재구현하는 작업. Manus 원본 코드는 MySQL/Drizzle/tRPC/wouter 스택이라 그대로
이식하지 않고, 스펙을 이 저장소의 서버액션/RLS 구조에 맞게 옮긴다.

## ✅ 1단계 — 기반 (완료, 이 PR)

모든 후속 기능이 얹히는 토대.

- **DB (`0004_admin_superadmin.sql`)**
  - 관리자 RBAC: `admin_roles`, `admin_permissions`, `admin_role_permissions`, `admin_users.role_key`
  - `admin_activity_logs` (관리자 활동 감사 로그), `admin_notes` (운영자 메모)
  - `profiles` 확장: `suspended_until`, `suspend_reason`, `warning_count`, `last_active_at`,
    `marketing_opt_in`, `utm_*`, `referrer`
  - `categories` 확장: `icon`, `intro`, `cover_image_url`, `read/write/comment_level`,
    `requires_approval`, `is_anonymous`, `max_images`, `allow_tags`
  - 신규 테이블 전부 RLS(admin-only) 적용, 새 profile 컬럼은 컬럼 보호 트리거로 자가수정 차단
  - 역할 8종 + 권한 25종 + 매핑 시드. super_admin=전체, 나머지 역할별 서브셋
  - **검증:** 로컬 PostgreSQL 16에서 0001→0004+seed 전부 적용 성공, 기존 RLS 회귀 테스트 26건 PASS/0 FAIL
- **권한 레이어 (`apps/admin/lib`)**
  - `requireAdmin`이 역할·권한 집합까지 로드 (`can(perm)`)
  - `requirePermission(perm)` — 페이지/액션 권한 게이트 (미보유 시 `/denied`)
  - `logActivity(...)` — 모든 주요 mutation을 IP/UA와 함께 감사 로그에 기록
- **통합 어드민 레이아웃**
  - 그룹형 좌측 사이드바(권한별 메뉴 필터), 모바일 드로어, 상단 breadcrumb 헤더, 관리자 역할 표시
- **확장 대시보드**: KPI 12종(등급별/오늘/7·30일 활성/신고·자료 대기), 전환 퍼널, 등급 분포,
  오늘 처리할 업무, 최근 관리자 활동(감사 로그 연동)
- **시스템 메뉴**
  - `/system/roles` — 관리자별 역할 지정(super_admin 자기강등 방지) + 역할×권한 매트릭스
  - `/system/activity-logs` — 활동 로그 조회(액션 필터, 관리자/대상/IP 표시)
- 기존 액션(등급변경·정지·게시글/댓글 상태·신고·자료·공지·게시판·관리자) 전부 권한검사 + 활동로그 연동

## ✅ 2단계 — 회원관리 확장 (진행 중)

- **회원 목록**: 등급·상태 필터, 검색, 서버 페이지네이션(50/페이지), 총원 표시,
  CSV 내보내기(`/members/export`, `members.export` 권한, UTF-8 BOM·필터 반영)
- **회원 상세**: 누적 경고/정지 만료일 표시, 최근 게시글·댓글, 유입(UTM) 정보,
  경고 부여(누적+메모 자동기록), 기간 정지(1/3/7/30일·영구, `suspended_until`),
  운영자 메모(`admin_notes`) 추가/조회
- **신규 액션**: `addWarning`, `setTimedSuspension`, `addAdminNote` — 전부 권한검사 + 활동로그 연동
- 회원 목록/상세 페이지에 `members.view` / `members.suspend` 권한 게이트 적용

남은 항목: 튜터/정지회원 전용 뷰, 승급 후보 큐, 필터 추가(지역/배우상태/마케팅수신 등)

## ✅ 3단계 — 게시판 관리 + UI 정돈 (진행 중)

- **게시판 관리**: 0004에서 추가한 운영 컬럼을 실제 UI에 연결 — 아이콘, 소개 문구,
  열람/글쓰기/댓글 등급 게이트, 승인 후 공개, 익명, 이미지 최대 개수, 태그 사용 설정 저장
  (검증 스키마·`updateCategory` 액션·행 편집 폼 확장). `community.manage` 권한 게이트.
  ※ 등급 게이트 값은 저장되며, 커뮤니티 앱 쓰기/열람 로직 반영은 후속 작업.
- **UI/UX 정돈(카드 최소화)**: Manus 스펙(§4 "카드·박스 남발 금지, 테이블·타이포 중심")에 맞춰
  대시보드·회원 상세·게시판 관리를 박스 대신 구분선(divide)·섹션 헤더·타이포 중심으로 재구성.
  대시보드 KPI는 12개 개별 카드 → 하나의 분할 패널로 통합.

- **게시글 관리**: 체크박스 일괄 처리(숨김/복구/삭제), 인라인 게시판 이동(드롭다운),
  상단 고정 정렬, 테이블형 UI. 신규 액션 `movePost`·`bulkSetPostStatus`(권한검사+활동로그).
  목록 `community.view` 게이트.

남은 항목: 게시글 추천 지정(신규 컬럼), 오디션 전용 필드(`audition_post_details` 신규),
오프라인 모임 상태·신청자(`meetup_registrations` 신규) — 신규 마이그레이션 `0005` 필요.

## ⏭ 다음 단계 (우선순위)
- **3단계 게시판/게시글**: 게시판 CRUD·순서·등급게이트 UI, 게시글 일괄처리/이동/추천, 오디션 전용 필드
  (`audition_post_details`), 모임 상태·신청자(`meetup_registrations`)
- **4단계 CMS/SEO**: 사이트 기본정보·헤더·푸터·디자인 토큰, 페이지 콘텐츠, 팝업, 약관, 페이지별 SEO/OG,
  robots/sitemap/redirect
- **5단계 마케팅/데이터/자동화**: 트래킹 연동·이벤트·UTM, Google Sheets 단방향 동기화(큐/재시도),
  자동화 규칙 엔진, 알림/메시지 템플릿

세부 요구사항은 `pasted_content.txt`(원본 스펙)와 `todo-pgo7amlf.md` 참조.
