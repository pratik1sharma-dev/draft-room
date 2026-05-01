-- Add delivery date and revisions to contracts
alter table public.contracts add column if not exists proposed_delivery_date date;
alter table public.contracts add column if not exists proposed_revisions integer default 2;

alter table public.contracts add column if not exists agreed_delivery_date date;
alter table public.contracts add column if not exists agreed_revisions integer;
