-- Recreate Jordan by cloning a working auth user shape (avoids email rate limits).
-- Run in SQL Editor.

do $$
declare
  jordan_id uuid := gen_random_uuid();
  template auth.users%rowtype;
begin
  select * into template
  from auth.users
  where lower(email) = 'admin@afsp.com'
  limit 1;

  if template.id is null then
    raise exception 'admin@afsp.com template user not found';
  end if;

  -- Remove any leftover broken jordan row first
  delete from auth.users where lower(email) = 'jordan@afsp.com';

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  ) values (
    template.instance_id,
    jordan_id,
    template.aud,
    template.role,
    'jordan@afsp.com',
    crypt('Athlete123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"athlete","name":"Jordan Cole","sport":"Football","created_by":"self"}'::jsonb,
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  );

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    id,
    email
  ) values (
    jordan_id::text,
    jordan_id,
    jsonb_build_object(
      'sub', jordan_id::text,
      'email', 'jordan@afsp.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now(),
    gen_random_uuid(),
    'jordan@afsp.com'
  );
end $$;

-- Ensure profile + athlete rows
insert into public.profiles (id, role, name, email)
select
  u.id,
  'athlete',
  'Jordan Cole',
  'jordan@afsp.com'
from auth.users u
where lower(u.email) = 'jordan@afsp.com'
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

select email, email_confirmed_at is not null as confirmed
from auth.users
where lower(email) in ('admin@afsp.com', 'marcus@afsp.com', 'jordan@afsp.com')
order by email;
