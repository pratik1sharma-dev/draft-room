-- Add pending_draftsman and declined statuses to contracts
alter table public.contracts drop constraint contracts_status_check;
alter table public.contracts add constraint contracts_status_check
  check (status in ('pending_draftsman', 'active', 'completed', 'declined', 'disputed'));

-- Allow draftsman to update contract (accept / decline)
create policy "contracts_update_draftsman" on public.contracts
  for update using (auth.uid() = draftsman_id);
