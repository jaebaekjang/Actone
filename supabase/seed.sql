-- Act One seed data
-- 8 categories (exact order), regular_member_rule default (OFF), sample posts.
-- Sample posts have author_id = null and are displayed as "액트원 운영진" in the UI.

insert into categories (name, slug, description, sort_order, is_active)
values
('오프라인 모임', 'offline-meetups', '배우들이 직접 만나 대화하고 연결될 수 있는 오프라인 모임 공간입니다. 네트워킹, 소규모 모임, 번개, 액트원 모임 등을 공유할 수 있습니다.', 1, true),
('배우 생존방', 'actor-survival', '배우 생활을 하며 혼자 삼켰던 이야기를 나누는 공간입니다. 불안, 자존감, 생계, 부모님 설득, 포기와 재시작에 대한 이야기를 남길 수 있습니다.', 2, true),
('오디션 정보 공유방', 'audition-info', '단편영화, 독립영화, 연극, 웹드라마, 숏폼, 광고 등 배우들이 지원할 수 있는 정보를 공유하는 공간입니다.', 3, true),
('스터디', 'study', '대본 리딩, 독백 연습, 카메라 연기, 발성, 움직임, 오디션 준비 등 배우들이 함께 연습할 사람을 찾는 공간입니다.', 4, true),
('현장 후기방', 'field-reviews', '오디션, 촬영장, 연극팀, 미팅 경험을 공유하는 공간입니다. 단, 특정 개인이나 단체를 실명으로 비방하는 글은 제한될 수 있습니다.', 5, true),
('자유게시판', 'free-board', '배우 생활, 일상, 질문, 잡담을 자유롭게 나누는 공간입니다.', 6, true),
('자료실', 'resources', '배우 커리어, 오디션 지원, 현장 준비, 커뮤니티 이용에 도움이 되는 자료를 모아두는 공간입니다.', 7, true),
('공지사항', 'notices', '액트원 운영 공지와 업데이트를 확인하는 공간입니다.', 8, true)
on conflict (slug) do nothing;

-- Automatic regular-member upgrade rule. MUST default to enabled = false.
insert into app_settings (key, value)
values (
  'regular_member_rule',
  '{"enabled": false, "minDaysAfterJoin": 7, "minPostCount": 1, "minCommentCount": 3, "maxReceivedReports": 0}'::jsonb
)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- sample posts
-- ---------------------------------------------------------------------------

-- notice (pinned, shown on community home top)
insert into posts (category_id, author_id, title, content, is_pinned, status)
select id, null,
  '액트원 커뮤니티에 오신 것을 환영합니다.',
  E'액트원은 인맥 없이 배우를 시작한 사람들을 위한 커뮤니티입니다.\n서로의 경험과 정보를 나누되, 개인을 공격하거나 확인되지 않은 내용을 사실처럼 쓰는 것은 지양해주세요.',
  true, 'published'
from categories where slug = 'notices';

-- offline meetup sample
with meetup_post as (
  insert into posts (category_id, author_id, title, content, tags, status)
  select id, null,
    '액트원 첫 오프라인 모임이 열린다면 어떤 이야기를 나누고 싶나요?',
    '배우 생활을 하다 보면 같은 고민을 가진 사람을 직접 만나 이야기하고 싶을 때가 있습니다. 액트원에서 첫 오프라인 모임이 열린다면 어떤 주제와 분위기가 좋을까요?',
    array['서울', '네트워킹', '액트원모임'], 'published'
  from categories where slug = 'offline-meetups'
  returning id
)
insert into offline_meetup_details (post_id, region, capacity, fee, is_regular_member_only)
select id, '서울', 10, '무료', true from meetup_post;

-- actor survival sample
insert into posts (category_id, author_id, title, content, tags, status)
select id, null,
  '배우를 계속해도 되는지 모르겠을 때',
  E'오디션을 계속 지원해도 연락이 없으면, 어느 순간 실력보다 나 자체가 문제인 것처럼 느껴질 때가 있습니다.\n비슷한 경험이 있는 분들은 어떻게 버텼나요?',
  array['고민', '멘탈', '슬럼프'], 'published'
from categories where slug = 'actor-survival';

-- study sample
insert into posts (category_id, author_id, title, content, tags, status)
select id, null,
  '대본 리딩 스터디는 어떤 방식이 가장 부담 없을까요?',
  '처음 만나는 사람들과 대본 리딩을 한다면 온라인이 좋을지, 오프라인이 좋을지 고민됩니다. 배우들이 부담 없이 참여할 수 있는 스터디 방식은 어떤 형태일까요?',
  array['대본리딩', '독백스터디'], 'published'
from categories where slug = 'study';

-- audition info sample
insert into posts (category_id, author_id, title, content, tags, status)
select id, null,
  '단편영화 지원할 때 페이 없는 공고도 지원하시나요?',
  E'경력이 부족한 단계에서는 무페이 단편도 해야 하는지 고민됩니다.\n다들 어떤 기준으로 지원 여부를 판단하시나요?',
  array['단편영화'], 'published'
from categories where slug = 'audition-info';

-- field review sample
insert into posts (category_id, author_id, title, content, tags, status)
select id, null,
  '첫 촬영장에서 미리 알았으면 좋았을 것들',
  E'처음 촬영장에 갔을 때 용어도 모르고, 어디에 서 있어야 하는지도 몰라서 많이 긴장했습니다.\n초보 배우가 현장 가기 전에 꼭 알고 가면 좋은 것들이 있을까요?',
  array['촬영후기', '조심할점'], 'published'
from categories where slug = 'field-reviews';
