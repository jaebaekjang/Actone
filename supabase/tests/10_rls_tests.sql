-- Behavioral RLS tests. Lines beginning with PASS/FAIL are assertions.
-- Statements marked "EXPECT-ERROR" are supposed to fail.

-- ---- emulate Supabase default table grants (RLS still restricts rows) ----
grant all on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
-- re-apply the migration's explicit revokes so final state matches production
revoke select on public.public_profiles, public.offline_meetup_public from anon;
revoke execute on function public.get_meetup_application_url(uuid) from anon;
revoke execute on function public.increment_view_count(uuid) from anon;

-- ---- create users (simulates Kakao signup) ----
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-0000000000a1', 'usera@test.com', '{"provider_id":"kakao_a","avatar_url":"https://k.kakaocdn.net/a.png"}'),
 ('00000000-0000-0000-0000-0000000000b2', 'userb@test.com', '{}'),
 ('00000000-0000-0000-0000-0000000000c3', 'admin@test.com', '{}'),
 ('00000000-0000-0000-0000-0000000000d4', 'userd@test.com', '{}');

select case when count(*) = 4 then 'PASS: handle_new_user auto-created 4 profiles'
       else 'FAIL: handle_new_user (' || count(*) || ')' end from profiles;

select case when kakao_id = 'kakao_a' and avatar_url like 'https://k.kakao%'
       then 'PASS: kakao metadata copied' else 'FAIL: kakao metadata' end
from profiles where id = '00000000-0000-0000-0000-0000000000a1';

-- ---- user A onboards (own row update allowed) ----
set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000a1';
update profiles set nickname = 'userA', actor_status = '배우 지망생',
  activity_field = '독립영화', region = '서울', expectation = '{"오프라인 모임"}',
  onboarding_completed = true
where id = auth.uid();
reset role;
select case when onboarding_completed and member_level = 'new_member'
       then 'PASS: onboarding + default new_member' else 'FAIL: onboarding' end
from profiles where nickname = 'userA';

-- ---- A cannot self-escalate (EXPECT-ERROR x3) ----
set role authenticated;
update profiles set member_level = 'tutor' where id = auth.uid();      -- EXPECT-ERROR
update profiles set role = 'admin' where id = auth.uid();              -- EXPECT-ERROR
update profiles set is_suspended = false, role = 'admin' where id = auth.uid(); -- EXPECT-ERROR
reset role;
select case when member_level = 'new_member' and role = 'member'
       then 'PASS: self-escalation blocked' else 'FAIL: self-escalation!' end
from profiles where nickname = 'userA';

-- ---- A reads seeds, writes a post, comments, likes ----
set role authenticated;
select case when count(*) >= 6 then 'PASS: authenticated reads published seeds'
       else 'FAIL: seed read (' || count(*) || ')' end from posts where status = 'published';

insert into posts (category_id, author_id, title, content)
select id, auth.uid(), 'A의 첫 글입니다', '내용은 열 자가 넘어야 합니다. 충분히 길게.'
from categories where slug = 'free-board';

-- resources/notices are admin-only (EXPECT-ERROR x2)
insert into posts (category_id, author_id, title, content)
select id, auth.uid(), '자료실 침입 시도', '이 글은 들어가면 안 됩니다. 열 자 이상.'
from categories where slug = 'resources';                              -- EXPECT-ERROR
insert into posts (category_id, author_id, title, content)
select id, auth.uid(), '공지 침입 시도', '이 글은 들어가면 안 됩니다. 열 자 이상.'
from categories where slug = 'notices';                                -- EXPECT-ERROR

-- pinning is admin-only (EXPECT-ERROR)
insert into posts (category_id, author_id, title, content, is_pinned)
select id, auth.uid(), '고정 시도 글입니다', '이 글은 고정되면 안 됩니다. 열 자 이상.', true
from categories where slug = 'free-board';                             -- EXPECT-ERROR

insert into comments (post_id, author_id, content)
select id, auth.uid(), '좋은 글이네요!' from posts where title = 'A의 첫 글입니다';

insert into post_likes (post_id, user_id)
select id, auth.uid() from posts where title = 'A의 첫 글입니다';
insert into post_likes (post_id, user_id)
select id, auth.uid() from posts where title = 'A의 첫 글입니다';      -- EXPECT-ERROR (duplicate)

select public.increment_view_count(id) from posts where title = 'A의 첫 글입니다';
reset role;

select case when comment_count = 1 and like_count = 1 and view_count = 1
       then 'PASS: counters maintained by triggers' else 'FAIL: counters' end
from posts where title = 'A의 첫 글입니다';

-- A cannot hide own post, only publish/delete (EXPECT-ERROR then ok)
set role authenticated;
update posts set status = 'hidden' where title = 'A의 첫 글입니다';    -- EXPECT-ERROR
update posts set status = 'deleted' where title = 'A의 첫 글입니다';
update posts set status = 'published' where title = 'A의 첫 글입니다';
reset role;

-- ---- meetup application_url gating ----
update offline_meetup_details set application_url = 'https://apply.example.com/first';

set role authenticated; -- A is new_member
select case when public.get_meetup_application_url(post_id) is null
       then 'PASS: new_member gets NULL application_url' else 'FAIL: URL leaked to new_member!' end
from offline_meetup_details limit 1;
select case when has_application_url then 'PASS: safe view exposes has_application_url flag'
       else 'FAIL: has_application_url flag' end from offline_meetup_public limit 1;
select count(*) as should_error from offline_meetup_details;           -- EXPECT-ERROR? no: returns 0 rows (not author/admin)
reset role;
select 'INFO: direct meetup table rows visible to A = (see previous count)' ;

-- upgrade A to regular_member (as system/admin)
update profiles set member_level = 'regular_member' where nickname = 'userA';
set role authenticated;
select case when public.get_meetup_application_url(post_id) = 'https://apply.example.com/first'
       then 'PASS: regular_member receives application_url' else 'FAIL: regular_member URL' end
from offline_meetup_public limit 1;
reset role;

-- ---- anon (guest) sees nothing ----
set role anon;
select case when count(*) = 0 then 'PASS: anon sees 0 posts' else 'FAIL: anon reads posts!' end from posts;
select case when count(*) = 0 then 'PASS: anon sees 0 categories' else 'FAIL: anon reads categories!' end from categories;
select case when count(*) = 0 then 'PASS: anon sees 0 profiles' else 'FAIL: anon reads profiles!' end from profiles;
select * from public_profiles limit 1;                                 -- EXPECT-ERROR (revoked)
select public.get_meetup_application_url('00000000-0000-0000-0000-000000000000'); -- EXPECT-ERROR (revoked)
reset role;

-- ---- suspended user B cannot write ----
update profiles set nickname = 'userB', onboarding_completed = true, is_suspended = true
where id = '00000000-0000-0000-0000-0000000000b2';

set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000b2';
insert into posts (category_id, author_id, title, content)
select id, auth.uid(), 'B의 글 시도입니다', '정지 회원은 쓸 수 없습니다. 열 자 이상.'
from categories where slug = 'free-board';                             -- EXPECT-ERROR
insert into comments (post_id, author_id, content)
select id, auth.uid(), '정지 회원 댓글' from posts limit 1;            -- EXPECT-ERROR
insert into post_likes (post_id, user_id) select id, auth.uid() from posts limit 1; -- EXPECT-ERROR
insert into reports (reporter_id, target_type, target_id, reason)
select auth.uid(), 'post', id, '욕설 / 비하' from posts limit 1;       -- EXPECT-ERROR
insert into resource_submissions (submitter_id, title, content)
values (auth.uid(), '정지 회원 제보', '내용');                          -- EXPECT-ERROR
select case when count(*) = 0 then 'PASS: admin_users hidden from non-admin'
       else 'FAIL: admin_users visible!' end from admin_users;
reset role;
select case when count(*) = 0 then 'PASS: suspended user wrote nothing'
       else 'FAIL: suspended user wrote!' end
from posts where author_id = '00000000-0000-0000-0000-0000000000b2';

-- ---- admin C ----
update profiles set nickname = 'adminC', onboarding_completed = true, role = 'admin'
where id = '00000000-0000-0000-0000-0000000000c3';
insert into admin_users (user_id, email, is_active)
values ('00000000-0000-0000-0000-0000000000c3', 'admin@test.com', true);

set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000c3';
select case when public.is_admin() then 'PASS: is_admin() true for role+active row'
       else 'FAIL: is_admin()' end;
insert into posts (category_id, author_id, title, content, is_pinned)
select id, auth.uid(), '관리자 공지입니다', '관리자는 공지를 쓸 수 있습니다. 고정 포함.', true
from categories where slug = 'notices';
update profiles set member_level = 'tutor',
  member_level_updated_at = now(), member_level_updated_by = auth.uid()
where nickname = 'userB';
insert into member_level_logs (user_id, previous_level, new_level, changed_by, change_type, reason)
values ('00000000-0000-0000-0000-0000000000b2', 'new_member', 'tutor', auth.uid(), 'manual', '테스트');
select case when count(*) >= 4 then 'PASS: admin reads all profiles'
       else 'FAIL: admin profile read' end from profiles;
select case when count(*) = 1 then 'PASS: admin reads admin_users' else 'FAIL' end from admin_users;
reset role;
select case when member_level = 'tutor' then 'PASS: admin manual tutor assignment'
       else 'FAIL: tutor assignment' end from profiles where nickname = 'userB';

-- deactivate admin C -> is_admin() must flip off
update admin_users set is_active = false where user_id = '00000000-0000-0000-0000-0000000000c3';
set role authenticated;
select case when not public.is_admin() then 'PASS: deactivated admin loses is_admin()'
       else 'FAIL: is_admin still true!' end;
reset role;
update admin_users set is_active = true where user_id = '00000000-0000-0000-0000-0000000000c3';

-- ---- auto-upgrade: OFF by default ----
update profiles set nickname = 'userD', onboarding_completed = true
where id = '00000000-0000-0000-0000-0000000000d4';

set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000d4';
insert into posts (category_id, author_id, title, content)
select id, auth.uid(), 'D의 글입니다 하나', '자동 승급 테스트용 게시글입니다. 열 자 이상.'
from categories where slug = 'free-board';
insert into comments (post_id, author_id, content)
select id, auth.uid(), '자동 승급 테스트 댓글 1' from posts where title = 'A의 첫 글입니다';
reset role;
select case when member_level = 'new_member'
       then 'PASS: no auto-upgrade while rule disabled'
       else 'FAIL: upgraded while disabled!' end from profiles where nickname = 'userD';

-- enable rule with zero thresholds
update app_settings set value = '{"enabled":true,"minDaysAfterJoin":0,"minPostCount":1,"minCommentCount":1,"maxReceivedReports":0}'
where key = 'regular_member_rule';

set role authenticated;
insert into comments (post_id, author_id, content)
select id, auth.uid(), '자동 승급 테스트 댓글 2' from posts where title = 'A의 첫 글입니다';
reset role;
select case when member_level = 'regular_member'
       then 'PASS: auto-upgrade fires when enabled + conditions met'
       else 'FAIL: auto-upgrade did not fire (' || member_level || ')' end
from profiles where nickname = 'userD';
select case when count(*) = 1 then 'PASS: automatic upgrade logged'
       else 'FAIL: automatic log' end
from member_level_logs where change_type = 'automatic'
and user_id = '00000000-0000-0000-0000-0000000000d4';

-- ---- reports flow (user A files, admin resolves) ----
set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000a1';
insert into reports (reporter_id, target_type, target_id, reason, detail)
select auth.uid(), 'post', id, '홍보 / 스팸', '테스트 신고' from posts where title = 'D의 글입니다 하나';
select case when count(*) = 1 then 'PASS: reporter reads own report' else 'FAIL' end from reports;
update reports set status = 'resolved' where reporter_id = auth.uid(); -- EXPECT-ERROR (admin only)
reset role;
select case when status = 'pending' then 'PASS: non-admin cannot resolve report'
       else 'FAIL: report resolved by reporter!' end from reports limit 1;

set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000c3';
update reports set status = 'resolved', admin_note = '조치 완료', resolved_at = now()
where status = 'pending';
update posts set status = 'hidden' where title = 'D의 글입니다 하나';
reset role;
select case when status = 'hidden' then 'PASS: admin hid reported post' else 'FAIL' end
from posts where title = 'D의 글입니다 하나';

-- hidden post invisible to others, visible to author
set role authenticated;
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000a1';
select case when count(*) = 0 then 'PASS: hidden post invisible to other member'
       else 'FAIL: hidden post visible!' end from posts where title = 'D의 글입니다 하나';
set request.jwt.claim.sub to '00000000-0000-0000-0000-0000000000d4';
select case when count(*) = 1 then 'PASS: hidden post still visible to its author'
       else 'FAIL: author cannot see own hidden post' end from posts where title = 'D의 글입니다 하나';
reset role;

-- ---- resource submissions ----
set role authenticated;
insert into resource_submissions (submitter_id, title, content, source_url)
values (auth.uid(), '체크리스트 제보', '오디션 전 체크리스트입니다.', 'https://example.com');
update resource_submissions set status = 'approved' where submitter_id = auth.uid(); -- EXPECT-ERROR (admin only)
reset role;
select case when status = 'pending' then 'PASS: submitter cannot self-approve'
       else 'FAIL: self-approved!' end from resource_submissions limit 1;
