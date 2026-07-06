-- Act One post images (spec §20 optional feature)
-- post_images table + RLS + post-images storage bucket.
-- Rules: max 5 images per post, jpg/png/webp, 5MB each (type/size enforced
-- client-side and by upload path; count enforced here as well).

-- ---------------------------------------------------------------------------
-- post_images
-- ---------------------------------------------------------------------------
create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index post_images_post_idx on public.post_images (post_id, sort_order);

-- hard cap: 5 images per post
create or replace function public.check_post_image_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.post_images where post_id = new.post_id) >= 5 then
    raise exception 'a post can have at most 5 images';
  end if;
  return new;
end;
$$;

create trigger post_images_limit
  before insert on public.post_images
  for each row execute function public.check_post_image_limit();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.post_images enable row level security;

-- readable wherever the parent post is readable
create policy "post_images: read with post" on public.post_images
  for select to authenticated
  using (
    exists (
      select 1 from public.posts p
      where p.id = post_id
        and (p.status = 'published' or p.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "post_images: author insert" on public.post_images
  for insert to authenticated
  with check (
    public.is_active_member()
    and exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

create policy "post_images: author or admin delete" on public.post_images
  for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.posts p
      where p.id = post_id and p.author_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- post-images storage bucket (public read, owner-scoped writes)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post-images: upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "post-images: delete own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "post-images: public read" on storage.objects
  for select to authenticated
  using (bucket_id = 'post-images');
