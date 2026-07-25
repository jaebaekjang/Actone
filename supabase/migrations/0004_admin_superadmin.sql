-- Act One super-admin foundation
-- Adds admin RBAC (roles / permissions), activity logging, internal notes,
-- and extends profiles / categories with operations columns.
-- Idempotent where practical; safe to run after 0001-0003.

-- ===========================================================================
-- profiles: operations columns
-- ===========================================================================
alter table public.profiles
  add column if not exists suspended_until timestamptz,
  add column if not exists suspend_reason text,
  add column if not exists warning_count int not null default 0,
  add column if not exists last_active_at timestamptz,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referrer text;

-- ===========================================================================
-- categories: board operation columns (per-level gating, presentation)
-- ===========================================================================
alter table public.categories
  add column if not exists icon text,
  add column if not exists intro text,
  add column if not exists cover_image_url text,
  add column if not exists read_level text not null default 'new_member'
    check (read_level in ('guest', 'new_member', 'regular_member', 'tutor')),
  add column if not exists write_level text not null default 'new_member'
    check (write_level in ('new_member', 'regular_member', 'tutor', 'admin')),
  add column if not exists comment_level text not null default 'new_member'
    check (comment_level in ('new_member', 'regular_member', 'tutor', 'admin')),
  add column if not exists requires_approval boolean not null default false,
  add column if not exists is_anonymous boolean not null default false,
  add column if not exists max_images int not null default 5,
  add column if not exists allow_tags boolean not null default true;

-- ===========================================================================
-- admin RBAC: roles, permissions, role<->permission map
-- ===========================================================================
create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  description text,
  is_system boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  category text not null default 'general',
  sort_order int not null default 0
);

create table if not exists public.admin_role_permissions (
  role_id uuid not null references public.admin_roles(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- link admins to a role (default resolved to super_admin in backfill below)
alter table public.admin_users
  add column if not exists role_key text not null default 'super_admin',
  add column if not exists last_login_at timestamptz;

-- ===========================================================================
-- admin_activity_logs: audit trail for every meaningful admin mutation
-- ===========================================================================
create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  summary text,
  before_data jsonb,
  after_data jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_idx
  on public.admin_activity_logs (created_at desc);
create index if not exists admin_activity_logs_admin_idx
  on public.admin_activity_logs (admin_id, created_at desc);
create index if not exists admin_activity_logs_target_idx
  on public.admin_activity_logs (target_type, target_id);

-- ===========================================================================
-- admin_notes: free-form operator notes attached to any entity
-- ===========================================================================
create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id text not null,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_notes_target_idx
  on public.admin_notes (target_type, target_id, created_at desc);

-- updated_at maintenance for new tables
create trigger set_updated_at before update on public.admin_roles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.admin_notes
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- protect newly added privileged profile columns from self-service edits
-- (re-create the existing trigger function with the extra guards)
-- ===========================================================================
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.role is distinct from old.role
      or new.member_level is distinct from old.member_level
      or new.is_suspended is distinct from old.is_suspended
      or new.suspended_until is distinct from old.suspended_until
      or new.suspend_reason is distinct from old.suspend_reason
      or new.warning_count is distinct from old.warning_count
      or new.onboarding_completed = false and old.onboarding_completed = true
      or new.member_level_updated_at is distinct from old.member_level_updated_at
      or new.member_level_updated_by is distinct from old.member_level_updated_by
      or new.member_level_note is distinct from old.member_level_note
      or new.created_at is distinct from old.created_at
    then
      raise exception 'not allowed to change protected profile fields';
    end if;
  end if;
  return new;
end;
$$;

-- ===========================================================================
-- RLS for new tables (admin-only), plus grants
-- ===========================================================================
alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.admin_notes enable row level security;

create policy "admin_roles: admin only" on public.admin_roles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_permissions: admin only" on public.admin_permissions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_role_permissions: admin only" on public.admin_role_permissions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_activity_logs: admin read" on public.admin_activity_logs
  for select to authenticated using (public.is_admin());
create policy "admin_activity_logs: admin insert" on public.admin_activity_logs
  for insert to authenticated with check (public.is_admin());

create policy "admin_notes: admin only" on public.admin_notes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- seed roles + permissions + default mapping
-- ===========================================================================
insert into public.admin_roles (key, label, description, is_system, sort_order) values
  ('super_admin',     '최고관리자',        '모든 메뉴와 액션에 접근', true, 0),
  ('member_admin',    '회원 관리자',       '회원 조회·등급·제재', false, 1),
  ('community_admin', '커뮤니티 관리자',   '게시판·게시글·댓글·신고', false, 2),
  ('audition_admin',  '오디션 게시판 관리자', '오디션 게시판 관리', false, 3),
  ('meetup_admin',    '오프라인 모임 관리자', '모임·신청자 관리', false, 4),
  ('resource_admin',  '자료 관리자',       '자료실 승인·반려', false, 5),
  ('marketing_admin', '마케팅 관리자',     'SEO·픽셀·분석·UTM', false, 6),
  ('viewer',          '데이터 조회 전용',  '읽기 전용', false, 7)
on conflict (key) do nothing;

insert into public.admin_permissions (key, label, category, sort_order) values
  ('dashboard.view',   '대시보드 조회',       'dashboard', 0),
  ('members.view',     '회원 조회',           'members', 10),
  ('members.manage',   '회원 정보 수정',      'members', 11),
  ('members.level',    '회원 등급 변경',      'members', 12),
  ('members.suspend',  '회원 정지/해제',      'members', 13),
  ('members.pii',      '회원 개인정보 조회',  'members', 14),
  ('members.export',   '회원 CSV 다운로드',   'members', 15),
  ('community.view',   '게시판/게시글 조회',  'community', 20),
  ('community.manage', '게시판/게시글/댓글 관리', 'community', 21),
  ('reports.manage',   '신고 처리',           'community', 22),
  ('audition.manage',  '오디션 게시판 관리',  'audition', 30),
  ('meetup.view',      '모임 조회',           'meetup', 40),
  ('meetup.manage',    '모임/신청자 관리',    'meetup', 41),
  ('meetup.pii',       '신청자 개인정보 조회', 'meetup', 42),
  ('resource.manage',  '자료실 승인/반려',    'resource', 50),
  ('notification.send','알림/메시지 발송',    'notification', 60),
  ('site.manage',      '사이트 CMS/디자인',   'site', 70),
  ('seo.manage',       'SEO 설정',            'seo', 80),
  ('marketing.manage', '마케팅/픽셀/분석',    'marketing', 90),
  ('data.manage',      '데이터/구글시트/내보내기', 'data', 100),
  ('automation.manage','자동화 규칙',         'automation', 110),
  ('system.admins',    '관리자 계정 관리',    'system', 120),
  ('system.roles',     '역할/권한 관리',      'system', 121),
  ('system.logs',      '관리자 활동 로그',    'system', 122),
  ('system.external',  '외부 코드 관리',      'system', 123)
on conflict (key) do nothing;

-- super_admin: every permission
insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id
from public.admin_roles r cross join public.admin_permissions p
where r.key = 'super_admin'
on conflict do nothing;

-- helper to attach a set of permission keys to a role key
do $$
declare
  mapping jsonb := '{
    "member_admin":    ["dashboard.view","members.view","members.manage","members.level","members.suspend","members.pii","members.export"],
    "community_admin": ["dashboard.view","community.view","community.manage","reports.manage","audition.manage","notification.send"],
    "audition_admin":  ["dashboard.view","community.view","audition.manage"],
    "meetup_admin":    ["dashboard.view","meetup.view","meetup.manage","meetup.pii"],
    "resource_admin":  ["dashboard.view","resource.manage"],
    "marketing_admin": ["dashboard.view","seo.manage","marketing.manage","data.manage"],
    "viewer":          ["dashboard.view","members.view","community.view","meetup.view"]
  }'::jsonb;
  role_key text;
  perm_key text;
begin
  for role_key in select jsonb_object_keys(mapping) loop
    for perm_key in select jsonb_array_elements_text(mapping -> role_key) loop
      insert into public.admin_role_permissions (role_id, permission_id)
      select r.id, p.id
      from public.admin_roles r, public.admin_permissions p
      where r.key = role_key and p.key = perm_key
      on conflict do nothing;
    end loop;
  end loop;
end $$;

-- existing admins keep full access (already granted before RBAC existed)
update public.admin_users set role_key = 'super_admin' where role_key is null;
