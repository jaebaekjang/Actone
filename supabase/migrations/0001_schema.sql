-- Act One community schema
-- Tables, constraints, indexes, and data-integrity triggers.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  kakao_id text,
  email text,
  nickname text unique,
  avatar_url text,
  actor_status text,
  activity_field text,
  region text,
  expectation text[] not null default '{}',
  bio text,
  role text not null default 'member' check (role in ('member', 'admin')),
  member_level text not null default 'new_member'
    check (member_level in ('new_member', 'regular_member', 'tutor')),
  is_suspended boolean not null default false,
  onboarding_completed boolean not null default false,
  member_level_updated_at timestamptz,
  member_level_updated_by uuid references public.profiles(id),
  member_level_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------------
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  email text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  author_id uuid references public.profiles(id),
  title text not null,
  content text not null,
  excerpt text,
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  status text not null default 'published' check (status in ('published', 'hidden', 'deleted')),
  view_count int not null default 0,
  like_count int not null default 0,
  comment_count int not null default 0,
  bookmark_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_category_status_created_idx on public.posts (category_id, status, created_at desc);
create index posts_author_idx on public.posts (author_id);
create index posts_status_created_idx on public.posts (status, created_at desc);
create index posts_tags_idx on public.posts using gin (tags);

-- ---------------------------------------------------------------------------
-- offline_meetup_details
-- application_url is sensitive: never exposed via a plain select for
-- unauthorized users (see 0002_rls.sql).
-- ---------------------------------------------------------------------------
create table public.offline_meetup_details (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts(id) on delete cascade,
  region text,
  meetup_date date,
  meetup_time time,
  venue text,
  capacity int,
  fee text,
  application_url text,
  is_regular_member_only boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- comments (flat, no nesting in MVP)
-- ---------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id),
  content text not null,
  status text not null default 'published' check (status in ('published', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_idx on public.comments (post_id, status, created_at);
create index comments_author_idx on public.comments (author_id);

-- ---------------------------------------------------------------------------
-- post_likes / bookmarks
-- ---------------------------------------------------------------------------
create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index post_likes_user_idx on public.post_likes (user_id, created_at desc);
create index bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null,
  detail text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index reports_status_idx on public.reports (status, created_at desc);
create index reports_target_idx on public.reports (target_type, target_id);

-- ---------------------------------------------------------------------------
-- resource_submissions
-- ---------------------------------------------------------------------------
create table public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  source_url text,
  submission_reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resource_submissions_status_idx on public.resource_submissions (status, created_at desc);

-- ---------------------------------------------------------------------------
-- member_level_logs
-- ---------------------------------------------------------------------------
create table public.member_level_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  previous_level text,
  new_level text not null,
  changed_by uuid references public.profiles(id),
  change_type text not null check (change_type in ('manual', 'automatic')),
  reason text,
  created_at timestamptz not null default now()
);

create index member_level_logs_user_idx on public.member_level_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- app_settings (key/value; regular_member_rule lives here)
-- ---------------------------------------------------------------------------
create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.admin_users
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.offline_meetup_details
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.comments
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.resource_submissions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profile auto-creation on signup (Kakao OAuth)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, kakao_id, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'provider_id',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- denormalized counters on posts
-- (security definer so they work regardless of the acting user's RLS rights)
-- ---------------------------------------------------------------------------
create or replace function public.refresh_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := coalesce(new.post_id, old.post_id);
begin
  update public.posts
  set comment_count = (
    select count(*) from public.comments
    where post_id = pid and status = 'published'
  )
  where id = pid;
  return coalesce(new, old);
end;
$$;

create trigger refresh_comment_count
  after insert or update or delete on public.comments
  for each row execute function public.refresh_post_comment_count();

create or replace function public.refresh_post_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := coalesce(new.post_id, old.post_id);
begin
  update public.posts
  set like_count = (select count(*) from public.post_likes where post_id = pid)
  where id = pid;
  return coalesce(new, old);
end;
$$;

create trigger refresh_like_count
  after insert or delete on public.post_likes
  for each row execute function public.refresh_post_like_count();

create or replace function public.refresh_post_bookmark_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid := coalesce(new.post_id, old.post_id);
begin
  update public.posts
  set bookmark_count = (select count(*) from public.bookmarks where post_id = pid)
  where id = pid;
  return coalesce(new, old);
end;
$$;

create trigger refresh_bookmark_count
  after insert or delete on public.bookmarks
  for each row execute function public.refresh_post_bookmark_count();
