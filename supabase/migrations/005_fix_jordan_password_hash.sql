-- Set Jordan's password to Athlete123! using a GoTrue-compatible bcrypt hash.

update auth.users
set
  encrypted_password = '$2b$10$fPigWetowJyoSUtV7boDWujtDUtA2F2p/ThS1aMLKGwfYDThIow/.',
  email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) = 'jordan@afsp.com';

select email, email_confirmed_at is not null as confirmed
from auth.users
where lower(email) = 'jordan@afsp.com';
