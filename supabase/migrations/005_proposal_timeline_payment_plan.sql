-- Add timeline to proposal and AI-generated payment plan
alter table public.contracts add column if not exists proposed_timeline text;
alter table public.contracts add column if not exists payment_plan jsonb;
