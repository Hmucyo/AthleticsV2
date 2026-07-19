-- Fixed seed/confirm script for AFSP demo users.
-- Do NOT update confirmed_at (generated column in newer Supabase).

-- 1) Confirm admin + coach
update auth.users
set email_confirmed_at = now()
where lower(email) in ('admin@afsp.com', 'marcus@afsp.com');

-- 2) Create or repair Jordan
do $$
declare
  jordan_id uuid;
begin
  select id into jordan_id from auth.users where lower(email) = 'jordan@afsp.com';

  if jordan_id is null then
    jordan_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      jordan_id,
      'authenticated',
      'authenticated',
      'jordan@afsp.com',
      crypt('Athlete123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"athlete","name":"Jordan Cole","sport":"Football","created_by":"self"}'::jsonb,
      now(),
      now()
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      jordan_id,
      jsonb_build_object('sub', jordan_id::text, 'email', 'jordan@afsp.com', 'email_verified', true),
      'email',
      jordan_id::text,
      now(),
      now(),
      now()
    );
  else
    update auth.users
    set
      email_confirmed_at = now(),
      encrypted_password = crypt('Athlete123!', gen_salt('bf')),
      raw_user_meta_data = '{"role":"athlete","name":"Jordan Cole","sport":"Football","created_by":"self"}'::jsonb
    where id = jordan_id;
  end if;
end $$;

-- 3) Profiles / athletes backfill
insert into public.profiles (id, role, name, email)
select
  u.id,
  coalesce((u.raw_user_meta_data->>'role')::public.user_role, 'athlete'),
  coalesce(nullif(u.raw_user_meta_data->>'name',''), split_part(u.email,'@',1)),
  lower(u.email)
from auth.users u
where lower(u.email) in ('admin@afsp.com', 'marcus@afsp.com', 'jordan@afsp.com')
on conflict (id) do update
  set role = excluded.role,
      name = excluded.name,
      email = excluded.email;

insert into public.athletes (user_id, name, email, sport, created_by)
select
  u.id,
  'Jordan Cole',
  'jordan@afsp.com',
  'Football',
  'self'
from auth.users u
where lower(u.email) = 'jordan@afsp.com'
on conflict (email) do update
  set user_id = excluded.user_id,
      name = excluded.name,
      sport = excluded.sport;

-- 4) Sample journal entry
insert into public.journal_entries (athlete_id, athlete_email, athlete_name, body, media)
select
  a.id,
  'jordan@afsp.com',
  'Jordan Cole',
  'Felt explosive today. Sprint block starts were sharp and recovery felt solid.',
  '[]'::jsonb
from public.athletes a
where lower(a.email) = 'jordan@afsp.com'
  and not exists (
    select 1 from public.journal_entries j where lower(j.athlete_email) = 'jordan@afsp.com'
  );

-- 5) Quick check
select email, email_confirmed_at is not null as confirmed
from auth.users
where lower(email) in ('admin@afsp.com', 'marcus@afsp.com', 'jordan@afsp.com')
order by email;
