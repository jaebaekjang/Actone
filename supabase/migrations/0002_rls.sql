-- Act One RLS policies, security helpers, and secure access paths.
--
-- Security model summary:
--  * Guests (anon) can read nothing in the community.
--  * All community reads require an authenticated user.
--  * offline_meetup_details.application_url is NEVER selectable by clients.
--    Safe columns are exposed through the offline_meetup_public view and the
--    URL only through get_meetup_application_url(), which checks member level.
--  * profiles private fields (email, kakao_id, ...) are only readable by the
--    owner and admins; other members read the public_profiles view.
--  * "Admin" in RLS = profiles.role = 'admin' AND active row in admin_users.
--  * Column-protection triggers stop members from touching role /
--    member_level / is_suspended / counters even though they can UPDATE
--    their own rows.

-- ---------------------------------------------------------------------------
-- helper functions (security definer so they can read regardless of RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.admin_users a on a.user_id = p.id
    where p.id = uid
      and p.role = 'admin'
      and a.is_active = true
  );
$$;

create or replace function public.is_active_member(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.is_suspended = false
  );
$$;

-- current user's member level ('' when not found)
create or replace function public.current_member_level(uid uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select member_level from public.profiles where id = uid),
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- column-protection triggers
-- Trigger functions owned by postgres run with current_user = 'postgres'
-- inside security-definer helpers, so internal/system updates pass; direct
-- client updates run as 'authenticated' and get checked.
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.role is distinct from old.role
      or new.member_level is distinct from old.member_level
      or new.is_suspended is distinct from old.is_suspended
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

create trigger protect_profile_columns before update on public.profiles
  for each row execute function public.protect_profile_columns();

create or replace function public.protect_post_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.is_pinned is distinct from old.is_pinned
      or new.view_count is distinct from old.view_count
      or new.like_count is distinct from old.like_count
      or new.comment_count is distinct from old.comment_count
      or new.bookmark_count is distinct from old.bookmark_count
      or new.author_id is distinct from old.author_id
      or new.created_at is distinct from old.created_at
    then
      raise exception 'not allowed to change protected post fields';
    end if;
    -- authors may only keep a post published or soft-delete it
    if new.status not in ('published', 'deleted') then
      raise exception 'not allowed to set this post status';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_post_columns before update on public.posts
  for each row execute function public.protect_post_columns();

create or replace function public.protect_comment_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.author_id is distinct from old.author_id
      or new.post_id is distinct from old.post_id
      or new.created_at is distinct from old.created_at
    then
      raise exception 'not allowed to change protected comment fields';
    end if;
    if new.status not in ('published', 'deleted') then
      raise exception 'not allowed to set this comment status';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_comment_columns before update on public.comments
  for each row execute function public.protect_comment_columns();

-- ---------------------------------------------------------------------------
-- enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.offline_meetup_details enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reports enable row level security;
alter table public.resource_submissions enable row level security;
alter table public.member_level_logs enable row level security;
alter table public.app_settings enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles: admin read all" on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy "profiles: insert own (callback fallback)" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: admin update all" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- public display fields for other members (no email / kakao_id / region etc.)
create or replace view public.public_profiles as
  select id, nickname, avatar_url, member_level, is_suspended
  from public.profiles;

revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to authenticated;

-- ---------------------------------------------------------------------------
-- admin_users (admins only; regular members can never read it)
-- ---------------------------------------------------------------------------
create policy "admin_users: admin only" on public.admin_users
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create policy "categories: authenticated read active" on public.categories
  for select to authenticated
  using (is_active = true or public.is_admin());

create policy "categories: admin manage" on public.categories
  for insert to authenticated
  with check (public.is_admin());

create policy "categories: admin update" on public.categories
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "categories: admin delete" on public.categories
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
create policy "posts: authenticated read published" on public.posts
  for select to authenticated
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

-- resources & notices categories are admin-publish-only
create policy "posts: members create" on public.posts
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_member()
    and status = 'published'
    and (is_pinned = false or public.is_admin())
    and (
      public.is_admin()
      or category_id not in (
        select id from public.categories where slug in ('resources', 'notices')
      )
    )
  );

create policy "posts: author update own" on public.posts
  for update to authenticated
  using (author_id = auth.uid() and public.is_active_member())
  with check (author_id = auth.uid());

create policy "posts: admin manage" on public.posts
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "posts: admin insert" on public.posts
  for insert to authenticated
  with check (public.is_admin() and author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- offline_meetup_details
-- Direct table SELECT is admin-only. Everyone else uses the safe view / RPC.
-- ---------------------------------------------------------------------------
-- direct table SELECT: admins, or the post author (who set the URL themselves)
create policy "meetup_details: admin or author read" on public.offline_meetup_details
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

create policy "meetup_details: post author insert" on public.offline_meetup_details
  for insert to authenticated
  with check (
    public.is_active_member()
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

create policy "meetup_details: post author update" on public.offline_meetup_details
  for update to authenticated
  using (
    public.is_admin()
    or (
      public.is_active_member()
      and exists (
        select 1 from public.posts p
        where p.id = post_id and p.author_id = auth.uid()
      )
    )
  );

create policy "meetup_details: admin delete" on public.offline_meetup_details
  for delete to authenticated
  using (public.is_admin());

-- Safe columns only. application_url is intentionally NOT here — only a
-- has_application_url flag so the UI can show the restriction notice.
create or replace view public.offline_meetup_public as
  select
    d.id,
    d.post_id,
    d.region,
    d.meetup_date,
    d.meetup_time,
    d.venue,
    d.capacity,
    d.fee,
    d.is_regular_member_only,
    (d.application_url is not null and d.application_url <> '') as has_application_url
  from public.offline_meetup_details d;

revoke all on public.offline_meetup_public from anon, authenticated;
grant select on public.offline_meetup_public to authenticated;

-- The only way a client can obtain application_url. Returns null unless the
-- caller is a non-suspended regular member / tutor, or an admin.
create or replace function public.get_meetup_application_url(p_post_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select d.application_url
  from public.offline_meetup_details d
  where d.post_id = p_post_id
    and (
      public.is_admin()
      or exists (
        select 1 from public.profiles pr
        where pr.id = auth.uid()
          and pr.is_suspended = false
          and pr.member_level in ('regular_member', 'tutor')
      )
    );
$$;

revoke all on function public.get_meetup_application_url(uuid) from anon, public;
grant execute on function public.get_meetup_application_url(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create policy "comments: authenticated read published" on public.comments
  for select to authenticated
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "comments: members create" on public.comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_member()
    and status = 'published'
  );

create policy "comments: author update own" on public.comments
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments: admin manage" on public.comments
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- post_likes / bookmarks
-- ---------------------------------------------------------------------------
create policy "likes: read own" on public.post_likes
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "likes: create own" on public.post_likes
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());

create policy "likes: delete own" on public.post_likes
  for delete to authenticated
  using (user_id = auth.uid());

create policy "bookmarks: read own" on public.bookmarks
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "bookmarks: create own" on public.bookmarks
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());

create policy "bookmarks: delete own" on public.bookmarks
  for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create policy "reports: create own" on public.reports
  for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and public.is_active_member()
    and status = 'pending'
  );

create policy "reports: read own or admin" on public.reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());

create policy "reports: admin manage" on public.reports
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- resource_submissions
-- ---------------------------------------------------------------------------
create policy "submissions: create own" on public.resource_submissions
  for insert to authenticated
  with check (
    submitter_id = auth.uid()
    and public.is_active_member()
    and status = 'pending'
  );

create policy "submissions: read own or admin" on public.resource_submissions
  for select to authenticated
  using (submitter_id = auth.uid() or public.is_admin());

create policy "submissions: admin manage" on public.resource_submissions
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- member_level_logs
-- ---------------------------------------------------------------------------
create policy "level_logs: read own or admin" on public.member_level_logs
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "level_logs: admin insert" on public.member_level_logs
  for insert to authenticated
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- app_settings (admin only)
-- ---------------------------------------------------------------------------
create policy "app_settings: admin only" on public.app_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- view count increment (no client update rights on counters)
-- ---------------------------------------------------------------------------
create or replace function public.increment_view_count(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts
  set view_count = view_count + 1
  where id = p_post_id and status = 'published';
$$;

revoke all on function public.increment_view_count(uuid) from anon, public;
grant execute on function public.increment_view_count(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- automatic regular-member upgrade
-- Runs after post/comment creation. Reads regular_member_rule from
-- app_settings; does NOTHING while enabled = false (the default).
-- Tutor is never assigned here — tutor certification is admin/manual only.
-- ---------------------------------------------------------------------------
create or replace function public.maybe_auto_upgrade_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rule jsonb;
  uid uuid := new.author_id;
  report_count int;
begin
  if uid is null then
    return new;
  end if;

  select value into rule from public.app_settings where key = 'regular_member_rule';
  if rule is null or coalesce((rule ->> 'enabled')::boolean, false) = false then
    return new;
  end if;

  -- only new_member, non-suspended accounts, past the min join age
  perform 1 from public.profiles
  where id = uid
    and member_level = 'new_member'
    and is_suspended = false
    and onboarding_completed = true
    and created_at <= now() - make_interval(days => coalesce((rule ->> 'minDaysAfterJoin')::int, 7));
  if not found then
    return new;
  end if;

  if (select count(*) from public.posts where author_id = uid and status <> 'deleted')
       < coalesce((rule ->> 'minPostCount')::int, 1) then
    return new;
  end if;

  if (select count(*) from public.comments where author_id = uid and status <> 'deleted')
       < coalesce((rule ->> 'minCommentCount')::int, 3) then
    return new;
  end if;

  select count(*) into report_count
  from public.reports r
  where r.status <> 'dismissed'
    and (
      (r.target_type = 'post' and r.target_id in (select id from public.posts where author_id = uid))
      or (r.target_type = 'comment' and r.target_id in (select id from public.comments where author_id = uid))
    );
  if report_count > coalesce((rule ->> 'maxReceivedReports')::int, 0) then
    return new;
  end if;

  update public.profiles
  set member_level = 'regular_member',
      member_level_updated_at = now(),
      member_level_note = '자동 정회원 승급'
  where id = uid;

  insert into public.member_level_logs (user_id, previous_level, new_level, changed_by, change_type, reason)
  values (uid, 'new_member', 'regular_member', null, 'automatic', '자동 정회원 승급 조건 충족');

  return new;
end;
$$;

create trigger auto_upgrade_on_post
  after insert on public.posts
  for each row execute function public.maybe_auto_upgrade_member();

create trigger auto_upgrade_on_comment
  after insert on public.comments
  for each row execute function public.maybe_auto_upgrade_member();

-- ---------------------------------------------------------------------------
-- avatars storage bucket (public read, owner-scoped writes)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: update own folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: delete own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: public read" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars');
