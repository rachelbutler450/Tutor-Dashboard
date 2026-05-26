-- ============================================================================
-- Tutor Dashboard — Supabase schema, triggers & Row Level Security policies
-- ============================================================================
create type public.review_status        as enum ('Not Asked', 'Asked', 'Reviewed');
create type public.session_performance  as enum ('Mastered', 'Needs Review', 'Struggled');

create table public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Tutors can view their own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Tutors can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Tutors can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create table public.students (
  id               uuid        primary key default gen_random_uuid(),
  tutor_id         uuid        not null references public.profiles (id) on delete cascade,
  name             text        not null,
  grade_year       text,
  timezone         text,
  parent_contact   text,
  curriculum       text,
  hourly_fee       numeric(10, 2),
  lessons_per_week smallint    not null default 1 check (lessons_per_week >= 0),
  preply_link      text,
  review_status    public.review_status not null default 'Not Asked',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index students_tutor_id_idx on public.students (tutor_id);
alter table public.students enable row level security;
create policy "Tutors can view their own students"   on public.students for select using (auth.uid() = tutor_id);
create policy "Tutors can insert their own students" on public.students for insert with check (auth.uid() = tutor_id);
create policy "Tutors can update their own students" on public.students for update using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);
create policy "Tutors can delete their own students" on public.students for delete using (auth.uid() = tutor_id);

create table public.session_logs (
  id           uuid        primary key default gen_random_uuid(),
  student_id   uuid        not null references public.students (id) on delete cascade,
  tutor_id     uuid        not null references public.profiles (id) on delete cascade,
  topic_name   text        not null,
  performance  public.session_performance not null default 'Needs Review',
  tutor_notes  text,
  session_date date        not null default current_date,
  created_at   timestamptz not null default now()
);
create index session_logs_student_id_idx on public.session_logs (student_id);
create index session_logs_tutor_id_idx   on public.session_logs (tutor_id);
alter table public.session_logs enable row level security;
create policy "Tutors can view their own session logs"   on public.session_logs for select using (auth.uid() = tutor_id);
create policy "Tutors can insert their own session logs" on public.session_logs for insert
  with check (auth.uid() = tutor_id and exists (select 1 from public.students s where s.id = student_id and s.tutor_id = auth.uid()));
create policy "Tutors can update their own session logs" on public.session_logs for update using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);
create policy "Tutors can delete their own session logs" on public.session_logs for delete using (auth.uid() = tutor_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger students_set_updated_at before update on public.students for each row execute function public.set_updated_at();
