---
paths:
  - "apps/admin/**/*.{ts,tsx}"
---

# 관리자 사이트 규칙

- 관리자 기능은 `apps/admin`에만 존재한다. 사용자 사이트에 관리자 UI/경로를 만들지 않는다.
- 모든 페이지·서버 액션은 `requireAdmin()`(apps/admin/lib/admin.ts)으로 서버 측 재검증:
  1) Supabase 세션, 2) `profiles.role = 'admin'`, 3) `admin_users.is_active = true`.
- UI 숨김만으로 권한을 처리하지 않는다.
- 비인가 사용자는 `/denied`("접근 권한이 없습니다. 관리자에게 문의해주세요." + 로그아웃 버튼)로.
- 비주얼은 라이트 운영 인터페이스(#F5F4F1 배경, 흰 서페이스, #D85B25 액센트).
  다크 마케팅 배경, 시네마틱 히어로, 거대 KPI 카드 금지. 밀도 있는 테이블 + 명확한 필터.
- 튜터 지정은 수동 전용이며 등급 변경은 `member_level_logs`에 기록되어야 한다.
