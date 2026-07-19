-- Remove the broken Jordan auth user so we can recreate it cleanly.
-- Profiles cascade-delete with auth.users; athlete row will keep email and can be relinked.

delete from auth.users
where lower(email) = 'jordan@afsp.com';

-- Keep athlete row (user_id becomes null via FK), or remove and recreate later:
-- optional cleanup of orphan athlete if you prefer a full reset:
-- delete from public.athletes where lower(email) = 'jordan@afsp.com';

select 'jordan auth user deleted' as status;
