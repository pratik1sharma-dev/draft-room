-- Full contract workflow state machine

-- Drop old constraints (handles any prior migration state)
alter table public.contracts drop constraint if exists contracts_status_check;

alter table public.contracts add constraint contracts_status_check check (
  status in (
    'offer_sent',
    'client_turn',
    'draftsman_turn',
    'terms_agreed',
    'in_progress',
    'in_review',
    'revision_requested',
    'completed',
    'declined',
    'cancelled',
    'disputed'
  )
);

alter table public.contracts alter column status set default 'offer_sent';

-- Discussion + terms columns
alter table public.contracts add column if not exists proposed_deliverables text;
alter table public.contracts add column if not exists proposed_amount numeric(10,2);
alter table public.contracts add column if not exists agreed_deliverables text;
alter table public.contracts add column if not exists agreed_amount numeric(10,2);
alter table public.contracts add column if not exists agreed_at timestamptz;

-- Draftsman can update contracts (accept/decline/submit/etc)
drop policy if exists "contracts_update_draftsman" on public.contracts;
create policy "contracts_update_draftsman" on public.contracts
  for update using (auth.uid() = draftsman_id);

-- Messages: both contract parties can read and write
drop policy if exists "messages_select_parties" on public.messages;
drop policy if exists "messages_insert_parties" on public.messages;

create policy "messages_select_parties" on public.messages for select using (
  auth.uid() in (
    select client_id from public.contracts where id = contract_id
    union
    select draftsman_id from public.contracts where id = contract_id
  )
);

create policy "messages_insert_parties" on public.messages for insert with check (
  auth.uid() = sender_id and
  auth.uid() in (
    select client_id from public.contracts where id = contract_id
    union
    select draftsman_id from public.contracts where id = contract_id
  )
);
