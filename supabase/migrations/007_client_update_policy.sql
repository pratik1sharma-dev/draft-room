-- Allow clients to update contracts (needed for counter-proposals)
create policy "contracts_update_client" on public.contracts
  for update using (auth.uid() = client_id);
