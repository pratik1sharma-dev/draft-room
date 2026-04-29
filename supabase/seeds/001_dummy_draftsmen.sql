-- Dummy draftsman personas for development/demo
-- Run in Supabase SQL Editor

-- 1. Arjun Mehta — Mumbai, senior AutoCAD + BIM specialist
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
values (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'arjun.mehta@draftroom.dev',
  crypt('DraftRoom@123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'
) on conflict (id) do nothing;

insert into public.users (id, email, role, name, phone, city, state)
values ('a1b2c3d4-0001-0001-0001-000000000001', 'arjun.mehta@draftroom.dev', 'draftsman', 'Arjun Mehta', '+91 98200 11234', 'Mumbai', 'Maharashtra')
on conflict (id) do nothing;

insert into public.profiles (user_id, bio, skills, hourly_rate, experience_years, linkedin_url, availability, is_verified, is_founding_member, portfolio_urls)
values (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Senior draftsman with 8 years working on high-rise residential and commercial projects across Mumbai and Pune. Specialise in AutoCAD working drawings, Revit BIM coordination, and shop drawings for interior fit-outs. Have worked with firms like Kapadia Associates and SNK Architects. Comfortable with IS codes, NBC 2016, and local MCGM submission formats.',
  ARRAY['AutoCAD', 'Revit', 'BIM', 'Structural Drawings'],
  950, 8,
  'https://linkedin.com/in/arjun-mehta-draftsman',
  true, true, true,
  ARRAY[]::text[]
) on conflict (user_id) do update set
  bio = EXCLUDED.bio, skills = EXCLUDED.skills, hourly_rate = EXCLUDED.hourly_rate,
  experience_years = EXCLUDED.experience_years, linkedin_url = EXCLUDED.linkedin_url,
  availability = EXCLUDED.availability, is_verified = EXCLUDED.is_verified,
  is_founding_member = EXCLUDED.is_founding_member;

-- 2. Priya Nair — Bangalore, SketchUp + 3D Rendering
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
values (
  'a1b2c3d4-0002-0002-0002-000000000002',
  'priya.nair@draftroom.dev',
  crypt('DraftRoom@123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'
) on conflict (id) do nothing;

insert into public.users (id, email, role, name, phone, city, state)
values ('a1b2c3d4-0002-0002-0002-000000000002', 'priya.nair@draftroom.dev', 'draftsman', 'Priya Nair', '+91 96320 44512', 'Bengaluru', 'Karnataka')
on conflict (id) do nothing;

insert into public.profiles (user_id, bio, skills, hourly_rate, experience_years, linkedin_url, availability, is_verified, is_founding_member, portfolio_urls)
values (
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Architectural visualiser and draftsman based in Bangalore. 5 years of experience creating photorealistic renders and walkthroughs for residential villas, apartment complexes, and retail interiors. Proficient in SketchUp + V-Ray pipeline and can also deliver 2D working drawings in AutoCAD. Clients include real estate developers and boutique interior design studios in Bengaluru and Hyderabad.',
  ARRAY['SketchUp', '3D Rendering', 'AutoCAD', 'Revit'],
  700, 5,
  'https://linkedin.com/in/priya-nair-arch-viz',
  true, false, true,
  ARRAY[]::text[]
) on conflict (user_id) do update set
  bio = EXCLUDED.bio, skills = EXCLUDED.skills, hourly_rate = EXCLUDED.hourly_rate,
  experience_years = EXCLUDED.experience_years, linkedin_url = EXCLUDED.linkedin_url,
  availability = EXCLUDED.availability, is_verified = EXCLUDED.is_verified,
  is_founding_member = EXCLUDED.is_founding_member;

-- 3. Rahul Sharma — Delhi, structural drawings specialist
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
values (
  'a1b2c3d4-0003-0003-0003-000000000003',
  'rahul.sharma@draftroom.dev',
  crypt('DraftRoom@123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'
) on conflict (id) do nothing;

insert into public.users (id, email, role, name, phone, city, state)
values ('a1b2c3d4-0003-0003-0003-000000000003', 'rahul.sharma@draftroom.dev', 'draftsman', 'Rahul Sharma', '+91 99101 78234', 'New Delhi', 'Delhi')
on conflict (id) do nothing;

insert into public.profiles (user_id, bio, skills, hourly_rate, experience_years, linkedin_url, availability, is_verified, is_founding_member, portfolio_urls)
values (
  'a1b2c3d4-0003-0003-0003-000000000003',
  'Delhi-based draftsman with 10 years of experience in structural and civil drawings. Have worked on government tenders, DDA housing projects, and private commercial complexes. Strong knowledge of SP-34, IS-456, and MCD by-laws. Can produce GFC drawings, bar bending schedules, and section details with precision. Available for both short-term and long-term retainer projects.',
  ARRAY['AutoCAD', 'Structural Drawings', 'BIM'],
  1100, 10,
  'https://linkedin.com/in/rahul-sharma-structural',
  true, true, true,
  ARRAY[]::text[]
) on conflict (user_id) do update set
  bio = EXCLUDED.bio, skills = EXCLUDED.skills, hourly_rate = EXCLUDED.hourly_rate,
  experience_years = EXCLUDED.experience_years, linkedin_url = EXCLUDED.linkedin_url,
  availability = EXCLUDED.availability, is_verified = EXCLUDED.is_verified,
  is_founding_member = EXCLUDED.is_founding_member;

-- 4. Deepa Krishnan — Chennai, BIM + Revit
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
values (
  'a1b2c3d4-0004-0004-0004-000000000004',
  'deepa.krishnan@draftroom.dev',
  crypt('DraftRoom@123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'
) on conflict (id) do nothing;

insert into public.users (id, email, role, name, phone, city, state)
values ('a1b2c3d4-0004-0004-0004-000000000004', 'deepa.krishnan@draftroom.dev', 'draftsman', 'Deepa Krishnan', '+91 94440 56789', 'Chennai', 'Tamil Nadu')
on conflict (id) do nothing;

insert into public.profiles (user_id, bio, skills, hourly_rate, experience_years, linkedin_url, availability, is_verified, is_founding_member, portfolio_urls)
values (
  'a1b2c3d4-0004-0004-0004-000000000004',
  'BIM specialist with 6 years of experience in Revit-based coordination for large-scale healthcare and institutional projects. Have managed clash detection, 4D scheduling, and LOD 300/400 modelling for projects in Chennai and Coimbatore. Autodesk Certified Professional (Revit). Also handle AutoCAD for permit drawings and CMDA submission sets.',
  ARRAY['BIM', 'Revit', 'AutoCAD'],
  800, 6,
  'https://linkedin.com/in/deepa-krishnan-bim',
  true, true, false,
  ARRAY[]::text[]
) on conflict (user_id) do update set
  bio = EXCLUDED.bio, skills = EXCLUDED.skills, hourly_rate = EXCLUDED.hourly_rate,
  experience_years = EXCLUDED.experience_years, linkedin_url = EXCLUDED.linkedin_url,
  availability = EXCLUDED.availability, is_verified = EXCLUDED.is_verified,
  is_founding_member = EXCLUDED.is_founding_member;

-- 5. Vikram Patel — Ahmedabad, general draftsman mid-level
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
values (
  'a1b2c3d4-0005-0005-0005-000000000005',
  'vikram.patel@draftroom.dev',
  crypt('DraftRoom@123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'
) on conflict (id) do nothing;

insert into public.users (id, email, role, name, phone, city, state)
values ('a1b2c3d4-0005-0005-0005-000000000005', 'vikram.patel@draftroom.dev', 'draftsman', 'Vikram Patel', '+91 98790 23456', 'Ahmedabad', 'Gujarat')
on conflict (id) do nothing;

insert into public.profiles (user_id, bio, skills, hourly_rate, experience_years, linkedin_url, availability, is_verified, is_founding_member, portfolio_urls)
values (
  'a1b2c3d4-0005-0005-0005-000000000005',
  'Ahmedabad-based draftsman with 3 years of experience primarily in residential bungalows and row houses. Proficient in AutoCAD 2D drafting and SketchUp 3D modelling. Have worked on AUDA submission drawings and vastu-compliant residential layouts for developers in Ahmedabad and Surat. Fast turnaround, responsive communication, and comfortable with tight deadlines.',
  ARRAY['AutoCAD', 'SketchUp'],
  450, 3,
  'https://linkedin.com/in/vikram-patel-cad',
  true, false, false,
  ARRAY[]::text[]
) on conflict (user_id) do update set
  bio = EXCLUDED.bio, skills = EXCLUDED.skills, hourly_rate = EXCLUDED.hourly_rate,
  experience_years = EXCLUDED.experience_years, linkedin_url = EXCLUDED.linkedin_url,
  availability = EXCLUDED.availability, is_verified = EXCLUDED.is_verified,
  is_founding_member = EXCLUDED.is_founding_member;

-- 6. Sneha Joshi — Pune, interiors + rendering
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
values (
  'a1b2c3d4-0006-0006-0006-000000000006',
  'sneha.joshi@draftroom.dev',
  crypt('DraftRoom@123', gen_salt('bf')),
  now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated'
) on conflict (id) do nothing;

insert into public.users (id, email, role, name, phone, city, state)
values ('a1b2c3d4-0006-0006-0006-000000000006', 'sneha.joshi@draftroom.dev', 'draftsman', 'Sneha Joshi', '+91 97650 34567', 'Pune', 'Maharashtra')
on conflict (id) do nothing;

insert into public.profiles (user_id, bio, skills, hourly_rate, experience_years, linkedin_url, availability, is_verified, is_founding_member, portfolio_urls)
values (
  'a1b2c3d4-0006-0006-0006-000000000006',
  'Interior drafting and visualisation specialist based in Pune with 7 years of experience. Work extensively with interior designers and architects on modular kitchen layouts, false ceiling plans, electrical and plumbing drawings, and furniture layouts. Skilled in SketchUp + Enscape for real-time walkthroughs and Revit for FF&E documentation. Clients include leading interior studios in Pune, Mumbai, and Nashik.',
  ARRAY['SketchUp', '3D Rendering', 'Revit', 'AutoCAD'],
  850, 7,
  'https://linkedin.com/in/sneha-joshi-interiors',
  true, false, true,
  ARRAY[]::text[]
) on conflict (user_id) do update set
  bio = EXCLUDED.bio, skills = EXCLUDED.skills, hourly_rate = EXCLUDED.hourly_rate,
  experience_years = EXCLUDED.experience_years, linkedin_url = EXCLUDED.linkedin_url,
  availability = EXCLUDED.availability, is_verified = EXCLUDED.is_verified,
  is_founding_member = EXCLUDED.is_founding_member;
