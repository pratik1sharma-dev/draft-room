-- Allow all authenticated users to read basic user info (name, city, state, role)
-- needed for marketplace: job listings show who posted, draftsman cards show location
drop policy if exists "users_select_own" on public.users;
create policy "users_select_all" on public.users for select using (true);
