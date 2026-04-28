-- Separate the private bearer token from the public user_id.
-- The client keeps auth_secret locally and sends it as `Authorization: Bearer ...`.
-- user_id is what gets shared in friend lists, summaries, etc.

alter table users add column auth_secret uuid not null;

create unique index if not exists users_auth_secret_idx on users (auth_secret);
