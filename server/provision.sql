-- Run this ONCE as the postgres SUPERUSER, NOT via `npm run migrate`.
-- It creates the dnevnik database and the app user the server uses.
--
-- Steps:
--   1. Replace the password below with a real strong one
--      (e.g. `openssl rand -base64 32`). Put the SAME password into server/.env
--      under DATABASE_URL.
--   2. As the superuser, connect to the default `postgres` database and run
--      the CREATE DATABASE / CREATE USER / GRANT block.
--   3. Then connect to the new `dnevnik` database (this is critical — schema
--      grants are per-database) and run the ALTER SCHEMA / GRANT block.
--   4. From the server folder, run `npm run migrate` to apply sql/001_init.sql.

-- ── Run while connected to database `postgres` ──────────────────────────────
create database dnevnik;

create user dnevnik_app with login password 'ChangeMeToAStrongPassword!';

grant all privileges on database dnevnik to dnevnik_app;


-- ── Run while connected to database `dnevnik` ───────────────────────────────
-- (Postgres 15+ requires explicit schema-level grants.)
alter schema public owner to dnevnik_app;
grant all on schema public to dnevnik_app;
