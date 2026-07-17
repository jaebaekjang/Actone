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

## ⏭ 다음 단계 (우선순위)

- **2단계 회원관리 확장**: 목록 필터 13종·CSV, 회원 상세(활동/이력/UTM/메모), 경고/기간정지(`suspended_until`),
  튜터/정지회원 뷰, 승급 후보 큐
- **3단계 게시판/게시글**: 게시판 CRUD·순서·등급게이트 UI, 게시글 일괄처리/이동/추천, 오디션 전용 필드
  (`audition_post_details`), 모임 상태·신청자(`meetup_registrations`)
- **4단계 CMS/SEO**: 사이트 기본정보·헤더·푸터·디자인 토큰, 페이지 콘텐츠, 팝업, 약관, 페이지별 SEO/OG,
  robots/sitemap/redirect
- **5단계 마케팅/데이터/자동화**: 트래킹 연동·이벤트·UTM, Google Sheets 단방향 동기화(큐/재시도),
  자동화 규칙 엔진, 알림/메시지 템플릿

세부 요구사항은 `pasted_content.txt`(원본 스펙)와 `todo-pgo7amlf.md` 참조.
