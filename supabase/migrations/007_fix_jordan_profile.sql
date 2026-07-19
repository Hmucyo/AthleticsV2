-- Fix profile/athlete data for dashboard-created users (e.g. Jordan).
-- Auth > Users has no role/name columns; those live in public.profiles.

-- Ensure Jordan profile has role + name
insert into public.profiles (id, role, name, email)
select
  u.id,
  'athlete'::public.user_role,
  'Jordan Cole',
  lower(u.email)
from auth.users u
where lower(u.email) = 'jordan@afsp.com'
on conflict (id) do update
  set role = excluded.role,
      name = excluded.name,
      email = excluded.email;

-- Ensure athlete row exists and is linked
insert into public.athletes (user_id, name, email, sport, created_by)
select
  u.id,
  'Jordan Cole',
  'jordan@afsp.com',
  'Football',
  'self'::public.athlete_created_by
from auth.users u
where lower(u.email) = 'jordan@afsp.com'
on conflict (email) do update
  set user_id = excluded.user_id,
      name = excluded.name,
      sport = excluded.sport,
      created_by = excluded.created_by;

-- Optional: sample journal if missing
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

-- Show result
select p.email, p.role, p.name, a.sport, a.user_id is not null as linked
from public.profiles p
left join public.athletes a on lower(a.email) = lower(p.email)
where lower(p.email) in ('admin@afsp.com', 'marcus@afsp.com', 'jordan@afsp.com')
order by p.email;
