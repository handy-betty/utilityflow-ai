-- UtilityFlow AI Supabase starter schema
-- Run in Supabase SQL Editor after creating your project.

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_number text unique,
  phone text,
  email text,
  address text,
  service_type text check (service_type in ('Electric','Broadband','Water')),
  created_at timestamptz default now()
);

create table if not exists technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  phone text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id),
  member_name text not null,
  address text,
  type text not null,
  priority text not null default 'Normal',
  status text not null default 'New',
  assigned_technician_id uuid references technicians(id),
  assigned_technician_name text,
  due_date date,
  description text,
  created_at timestamptz default now()
);

create table if not exists work_order_notes (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid references work_orders(id) on delete cascade,
  note text not null,
  created_at timestamptz default now()
);

create table if not exists qa_test_cases (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  title text not null,
  steps text,
  expected_result text,
  actual_result text,
  status text default 'Not Run',
  severity text default 'Medium',
  created_at timestamptz default now()
);

create table if not exists bug_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  module text,
  steps_to_reproduce text,
  expected_result text,
  actual_result text,
  severity text default 'Medium',
  priority text default 'Normal',
  status text default 'Open',
  created_at timestamptz default now()
);

create table if not exists release_notes (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  release_date date default current_date,
  summary text,
  fixed_bugs text,
  known_issues text,
  created_at timestamptz default now()
);

create table if not exists training_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  content text,
  created_at timestamptz default now()
);

create table if not exists assistant_articles (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null,
  details text,
  created_at timestamptz default now()
);
