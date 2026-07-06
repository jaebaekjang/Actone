# ACTONE TODO NEXT MODEL

우선순위 순.

## 1. Supabase 실인스턴스 적용 + 검증 (최우선)

이 리포에는 Supabase 자격 증명이 없어 코드/SQL은 실제 인스턴스에서 한 번도 실행되지 않았다.

1. Supabase 프로젝트 생성 → SQL Editor에서 `0001_schema.sql` → `0002_rls.sql` → `0003_post_images.sql` → `seed.sql` 순서로 실행. 에러가 나면 해당 구문 수정(특히 storage 정책은 프로젝트 설정에 따라 권한 이슈 가능).
2. 카카오 OAuth 연결 (README 절차).
3. `.env.local` 생성 후 `npm run dev:web`으로 수동 검증:
   - [ ] 카카오 로그인 → `/onboarding` → 저장 → `/community` 리다이렉트
   - [ ] profiles 행 자동 생성, member_level='new_member'
   - [ ] 글 작성/수정/삭제, 댓글, 좋아요/북마크 토글, 신고 접수
   - [ ] 게시글 이미지 첨부(write/edit, 최대 5장) → 상세 페이지 표시, post-images 버킷 업로드 확인
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

- 없음. 게시글 이미지 업로드(post_images)와 검색 결과 meetup 정보 표시는 2026-07-06 구현 완료.
- 참고: 이미지 삭제/글 삭제 시 storage 원본 파일은 남음(orphan). 필요하면 정리 배치 추가(스펙 외).

## 4. UI 개선 아이디어 (낮은 우선순위)

- 댓글 수정(현재 삭제만), 페이지네이션 → 무한 스크롤, 스켈레톤 로딩, OG 메타 이미지.
- 관리자 대시보드 기간 필터.

## 5. 배포

- Vercel 프로젝트 2개(README 표) + 도메인 연결(actone.kr, admin.actone.kr).
- Supabase Auth Redirect URL에 프로덕션 콜백 2개 등록 확인.
- siteConfig.socialLinks 실제 URL 채우기 (현재 빈 문자열 → "준비 중입니다").

## 이미 실행된 명령 (2026-07-06, post_images 구현 이후 재실행)

```bash
npm install                          # 성공
npm run lint                         # 성공 (에러/경고 0)
npm run build                        # 성공 (양쪽 모두)
npm run build --workspace apps/web   # 성공 (16 routes)
npm run build --workspace apps/admin # 성공 (20 routes)
```

빌드 에러 없음. 알려진 lint 경고 없음.
