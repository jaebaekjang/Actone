# ACTONE TODO NEXT MODEL

우선순위 순.

## 0. 이미 검증된 것 (2026-07-07)

- 마이그레이션 3개 + seed 전체가 **로컬 PostgreSQL 16에서 오류 없이 실행됨**.
- RLS 행동 테스트 26건 전부 PASS (`supabase/tests/`).
- **브라우저 E2E 49/49 PASS** (`e2e/`): 실제 Next.js 앱(무수정)을 Playwright로 구동 —
  게스트 차단, 온보딩 전체 플로우, 글 CRUD/soft delete, 댓글/좋아요/북마크(카운터 트리거),
  신고→관리자 처리→대상 숨김, 모임 신청 링크 게이팅(신규회원 DOM에 URL 부재 → 정회원 승급 후 노출),
  검색, 마이페이지, 자료 제보→승인→자료실 글 생성→운영진 표기, 관리자 /denied→권한 부여→대시보드,
  튜터 수동 지정 + manual 로그, 자동 승급 규칙 UI 기본 OFF까지 화면 단위 확인.
- 따라서 남은 리스크는 **Supabase 고유 레이어**(GoTrue/카카오 OAuth 리다이렉트,
  Storage 실제 업로드, PostgREST의 실제 뷰 권한/임베딩 동작)뿐이다.

## 1. Supabase 실인스턴스 적용 + 검증 (최우선)

이 리포에는 Supabase 자격 증명이 없어 실제 인스턴스에서는 실행되지 않았다.

1. Supabase 프로젝트 생성 → SQL Editor에서 `0001_schema.sql` → `0002_rls.sql` → `0003_post_images.sql` → `seed.sql` 순서로 실행. 에러가 나면 해당 구문 수정(특히 storage 정책은 프로젝트 설정에 따라 권한 이슈 가능).
2. 카카오 OAuth 연결 (README 절차).
3. `.env.local` 생성 후 `npm run dev:web`으로 수동 검증:
   - [ ] 카카오 로그인 → `/onboarding` → 저장 → `/community` 리다이렉트
   - [ ] profiles 행 자동 생성, member_level='new_member'
   - [ ] 글 작성/수정/삭제, 댓글, 좋아요/북마크 토글, 신고 접수
   - [ ] 카운터(like/comment/bookmark/view) 갱신 확인
   - [ ] 신규회원으로 모임 글에서 신청 링크 숨김 + 안내 문구
   - [ ] SQL로 정회원 승급 후 링크 표시 확인
   - [ ] 게스트(로그아웃)로 /community 접근 → /login 리다이렉트, REST로 posts 직접 조회 시 빈 결과
   - [ ] 정지 계정으로 글/댓글/좋아요 시도 → 실패
4. 관리자: README대로 최초 관리자 SQL 실행 → `npm run dev:admin`:
   - [ ] 비관리자 로그인 → /denied
   - [ ] 등급 변경 + member_level_logs 기록
   - [ ] 신고 처리(대상 숨김), 제보 승인 → 자료실 글 생성("액트원 운영진" 표시)
   - [ ] 자동 승급 ON 후 조건 충족 새 글 작성 → 승급 + automatic 로그, OFF에서 미동작

## 2. 버그 가능성 있는 지점 (실행 검증 시 주의)

- `handle_new_user`의 `raw_user_meta_data->>'provider_id'` — 카카오 메타데이터 키가 다르면 kakao_id null (치명적 아님).
- PostgREST에서 뷰 `public_profiles`/`offline_meetup_public` select 권한 — grant 구문이 프로젝트 기본 권한과 충돌하면 조정.
- `.or(tags.cs.{term})` 검색 — 특수문자 포함 검색어에서 PostgREST 파싱 에러 가능(현재 `,`/`%` 제거만 함). 문제 시 tags 조건 분리.
- Next Image의 카카오 CDN 도메인 — 실제 아바타 URL 호스트가 `k.kakaocdn.net`이 아니면 next.config.ts remotePatterns에 추가.

## 3. 남은 기능 (스펙 내, 선택)

- (완료됨) ~~게시글 이미지 업로드~~ — 0003 마이그레이션 + PostForm 업로더 + 글 상세 표시 구현.
- (완료됨) ~~검색 결과 오프라인 모임 카드 정보~~ — 홈/보드/검색 모두 표시.
- 글 수정 시 폼에서 제거한 이미지 파일의 Storage 정리(현재는 참조만 삭제, 파일은 잔존).

## 4. UI 개선 아이디어 (낮은 우선순위)

- 댓글 수정(현재 삭제만), 페이지네이션 → 무한 스크롤, 스켈레톤 로딩, OG 메타 이미지.
- 관리자 대시보드 기간 필터.

## 5. 배포

- Vercel 프로젝트 2개(README 표) + 도메인 연결(actone.kr, admin.actone.kr).
- Supabase Auth Redirect URL에 프로덕션 콜백 2개 등록 확인.
- siteConfig.socialLinks 실제 URL 채우기 (현재 빈 문자열 → "준비 중입니다").

## 이미 실행된 명령 (이 리포에서)

```bash
npm install                          # 성공
npm run build --workspace apps/web   # 성공 (16 routes)
npm run build --workspace apps/admin # 성공 (20 routes)
npm run lint                         # 성공 (에러/경고 0)
npm run build                        # 성공 (양쪽 모두, 이미지 기능 포함 재실행)
# 로컬 PostgreSQL 16 (supabase/tests/README.md 절차):
#   0001/0002/0003 마이그레이션 + seed 실행 성공, RLS 테스트 PASS 26 / FAIL 0
```

빌드 에러 없음. 알려진 lint 경고 없음.
