-- Navly — persist presence tracker data in the database.
--
-- Previously the Canada days tracker (streak, check-ins, travel log) lived
-- only in the browser's localStorage, meaning users lost all data on device
-- change or browser clear. This migration adds a presence_data column to
-- profiles so the client can sync to and restore from the database.

alter table public.profiles
  add column if not exists presence_data jsonb not null default '{}';
