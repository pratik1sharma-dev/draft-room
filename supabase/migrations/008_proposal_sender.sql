-- Track who sent the current pending proposal
alter table public.contracts add column if not exists proposal_sender_id uuid references public.users(id);
