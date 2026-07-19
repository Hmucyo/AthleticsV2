-- Extend athlete profiles, tighten RLS, and add journal media storage.

alter table public.athletes
  add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.athletes
  add column if not exists phone text;

-- Replace overly-open athletes select policy
drop policy if exists "athletes_select_authenticated" on public.athletes;
create policy "athletes_select_own_or_staff"
  on public.athletes for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.current_user_role() in ('admin', 'coach')
  );

-- Athletes can update their own row
drop policy if exists "athletes_update_own" on public.athletes;
create policy "athletes_update_own"
  on public.athletes for update
  to authenticated
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Profiles: allow users to update their name
-- (policy already exists as profiles_update_own)

-- Storage bucket for journal media
insert into storage.buckets (id, name, public)
values ('journal-media', 'journal-media', true)
on conflict (id) do nothing;

drop policy if exists "journal_media_read" on storage.objects;
create policy "journal_media_read"
  on storage.objects for select
  to public
  using (bucket_id = 'journal-media');

drop policy if exists "journal_media_upload_own" on storage.objects;
create policy "journal_media_upload_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "journal_media_update_own" on storage.objects;
create policy "journal_media_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "journal_media_delete_own" on storage.objects;
create policy "journal_media_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'journal-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
