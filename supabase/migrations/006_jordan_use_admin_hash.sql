-- Make Jordan use the same working password hash as admin.
-- After this, sign in as jordan@afsp.com with password: Admin123!
-- Then reset Jordan's password in Auth > Users to Athlete123!.

update auth.users
set
  encrypted_password = (
    select encrypted_password from auth.users where lower(email) = 'admin@afsp.com'
  ),
  email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) = 'jordan@afsp.com';

-- Ensure identity exists (needed for email login)
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
)
select
  u.id::text,
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now(),
  gen_random_uuid(),
  u.email
from auth.users u
where lower(u.email) = 'jordan@afsp.com'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );

select
  u.email,
  u.email_confirmed_at is not null as confirmed,
  exists(select 1 from auth.identities i where i.user_id = u.id) as has_identity
from auth.users u
where lower(u.email) = 'jordan@afsp.com';
