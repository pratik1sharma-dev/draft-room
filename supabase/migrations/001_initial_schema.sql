create extension if not exists "uuid-ossp";

create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('client', 'draftsman')),
  name text not null,
  phone text,
  city text,
  state text,
  created_at timestamptz default now()
);

create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade unique not null,
  bio text,
  avatar_url text,
  is_founding_member boolean default false,
  skills text[] default '{}',
  hourly_rate numeric(10,2),
  experience_years integer,
  portfolio_urls text[] default '{}',
  availability boolean default true,
  is_verified boolean default false,
  linkedin_url text,
  firm_name text,
  project_types text[] default '{}'
);

create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  skills_required text[] default '{}',
  budget_type text not null check (budget_type in ('fixed', 'hourly')),
  budget_amount numeric(10,2) not null,
  deadline date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  attachments text[] default '{}',
  created_at timestamptz default now()
);

create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  draftsman_id uuid references public.users(id) on delete cascade not null,
  cover_note text,
  proposed_rate numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(job_id, draftsman_id)
);

create table public.contracts (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) not null,
  client_id uuid references public.users(id) not null,
  draftsman_id uuid references public.users(id) not null,
  agreed_rate numeric(10,2) not null,
  status text not null default 'active' check (status in ('active', 'completed', 'disputed')),
  created_at timestamptz default now()
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references public.contracts(id) on delete cascade not null,
  sender_id uuid references public.users(id) not null,
  content text,
  file_url text,
  created_at timestamptz default now()
);

create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  contract_id uuid references public.contracts(id) not null,
  reviewer_id uuid references public.users(id) not null,
  reviewee_id uuid references public.users(id) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique(contract_id, reviewer_id)
);

-- RLS
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.contracts enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id);

create policy "jobs_select_all" on public.jobs for select using (true);
create policy "jobs_insert_own" on public.jobs for insert with check (auth.uid() = client_id);
create policy "jobs_update_own" on public.jobs for update using (auth.uid() = client_id);

create policy "applications_insert_own" on public.applications for insert with check (auth.uid() = draftsman_id);
create policy "applications_select_draftsman" on public.applications for select using (auth.uid() = draftsman_id);
create policy "applications_select_client" on public.applications for select using (
  auth.uid() in (select client_id from public.jobs where id = job_id)
);
create policy "applications_update_client" on public.applications for update using (
  auth.uid() in (select client_id from public.jobs where id = job_id)
);

create policy "contracts_select_parties" on public.contracts for select using (
  auth.uid() = client_id or auth.uid() = draftsman_id
);
create policy "contracts_insert_client" on public.contracts for insert with check (auth.uid() = client_id);
create policy "contracts_update_client" on public.contracts for update using (auth.uid() = client_id);

create policy "messages_select_parties" on public.messages for select using (
  auth.uid() in (select client_id from public.contracts where id = contract_id)
  or auth.uid() in (select draftsman_id from public.contracts where id = contract_id)
);
create policy "messages_insert_parties" on public.messages for insert with check (
  auth.uid() in (select client_id from public.contracts where id = contract_id)
  or auth.uid() in (select draftsman_id from public.contracts where id = contract_id)
);

create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_parties" on public.reviews for insert with check (
  auth.uid() in (select client_id from public.contracts where id = contract_id)
  or auth.uid() in (select draftsman_id from public.contracts where id = contract_id)
);

-- Founding member trigger: auto-badge first 100 signups per role
create or replace function public.handle_new_user()
returns trigger as $$
declare
  role_count integer;
begin
  select count(*) into role_count from public.users where role = NEW.role;
  insert into public.profiles (user_id, is_founding_member)
  values (NEW.id, role_count <= 100)
  on conflict (user_id) do nothing;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_user_created
  after insert on public.users
  for each row execute procedure public.handle_new_user();
