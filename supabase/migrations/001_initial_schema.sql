-- AFSP initial schema: profiles, athletes, journal entries + RLS
-- Run in Supabase SQL Editor if the setup script cannot apply it automatically.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('athlete', 'coach', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.athlete_created_by as enum ('admin', 'self');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null unique,
  sport text not null,
  created_by public.athlete_created_by not null default 'self',
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes (id) on delete cascade,
  athlete_email text not null,
  athlete_name text not null,
  body text not null default '',
  media jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists athletes_email_idx on public.athletes (email);
create index if not exists journal_entries_athlete_email_idx on public.journal_entries (athlete_email);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
  full_name text;
begin
  selected_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'athlete');
  full_name := coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1));

  insert into public.profiles (id, role, name, email)
  values (new.id, selected_role, full_name, lower(new.email))
  on conflict (id) do update
    set role = excluded.role,
        name = excluded.name,
        email = excluded.email;

  if selected_role = 'athlete' then
    insert into public.athletes (user_id, name, email, sport, created_by)
    values (
      new.id,
      full_name,
      lower(new.email),
      coalesce(nullif(new.raw_user_meta_data ->> 'sport', ''), 'General'),
      coalesce((new.raw_user_meta_data ->> 'created_by')::public.athlete_created_by, 'self')
    )
    on conflict (email) do update
      set user_id = excluded.user_id,
          name = excluded.name,
          sport = excluded.sport;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.athletes enable row level security;
alter table public.journal_entries enable row level security;

drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.current_user_role() in ('admin', 'coach')
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "athletes_select_authenticated" on public.athletes;
create policy "athletes_select_authenticated"
  on public.athletes for select
  to authenticated
  using (true);

drop policy if exists "athletes_insert_self_or_admin" on public.athletes;
create policy "athletes_insert_self_or_admin"
  on public.athletes for insert
  to authenticated
  with check (
    public.is_admin()
    or (auth.uid() = user_id and created_by = 'self')
  );

drop policy if exists "athletes_update_admin" on public.athletes;
create policy "athletes_update_admin"
  on public.athletes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "journal_select_own_or_staff" on public.journal_entries;
create policy "journal_select_own_or_staff"
  on public.journal_entries for select
  to authenticated
  using (
    lower(athlete_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.current_user_role() in ('admin', 'coach')
  );

drop policy if exists "journal_insert_own" on public.journal_entries;
create policy "journal_insert_own"
  on public.journal_entries for insert
  to authenticated
  with check (
    lower(athlete_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "journal_update_own" on public.journal_entries;
create policy "journal_update_own"
  on public.journal_entries for update
  to authenticated
  using (lower(athlete_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(athlete_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "journal_delete_own" on public.journal_entries;
create policy "journal_delete_own"
  on public.journal_entries for delete
  to authenticated
  using (lower(athlete_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- RPC: admin creates coach auth user metadata path uses signup from client;
-- this helper lets admins insert athlete profile rows for existing athlete accounts.
create or replace function public.admin_create_athlete_profile(
  p_name text,
  p_email text,
  p_sport text
)
returns public.athletes
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.athletes;
  athlete_user uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can create athlete profiles';
  end if;

  select id into athlete_user
  from public.profiles
  where lower(email) = lower(p_email) and role = 'athlete';

  if athlete_user is null then
    raise exception 'Athlete account not found. Athlete must sign up first.';
  end if;

  insert into public.athletes (user_id, name, email, sport, created_by)
  values (athlete_user, p_name, lower(p_email), p_sport, 'admin')
  on conflict (email) do update
    set name = excluded.name,
        sport = excluded.sport,
        created_by = 'admin',
        user_id = excluded.user_id
  returning * into result;

  return result;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.athletes to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;
grant execute on function public.admin_create_athlete_profile(text, text, text) to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Backfill profiles for users created before the trigger existed
insert into public.profiles (id, role, name, email)
select
  u.id,
  coalesce((u.raw_user_meta_data->>'role')::public.user_role, 'athlete'),
  coalesce(nullif(u.raw_user_meta_data->>'name',''), split_part(u.email,'@',1)),
  lower(u.email)
from auth.users u
on conflict (id) do update
  set role = excluded.role,
      name = excluded.name,
      email = excluded.email;

insert into public.athletes (user_id, name, email, sport, created_by)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'name',''), split_part(u.email,'@',1)),
  lower(u.email),
  coalesce(nullif(u.raw_user_meta_data->>'sport',''), 'General'),
  coalesce((u.raw_user_meta_data->>'created_by')::public.athlete_created_by, 'self')
from auth.users u
join public.profiles p on p.id = u.id
where p.role = 'athlete'
on conflict (email) do update
  set user_id = excluded.user_id,
      name = excluded.name,
      sport = excluded.sport;
