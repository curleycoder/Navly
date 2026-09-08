-- Public consultant listings must be verified, not just active.
--
-- Navly advertises a directory of certified RCICs and lawyers. Filtering in the
-- client is not enough: any query that forgets .eq('verified', true) would expose
-- an unverified licence claim about a real person. Enforce it at the database.
--
-- Admin writes use the service role key and bypass RLS, so the admin panel can
-- still see and edit unverified consultants while they are being vetted.

drop policy if exists "Anyone can read active consultants" on public.consultants;

create policy "Anyone can read verified active consultants"
  on public.consultants for select
  using (active = true and verified = true);
