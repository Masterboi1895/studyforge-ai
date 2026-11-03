-- StudyForge AI initial student schema. Apply via Supabase SQL editor or migration CLI.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '',
 grade text,
 curriculum text,
 learning_style text,
 onboarded boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.courses (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(name) between 1 and 100),
 subject text not null check(length(subject) between 1 and 100),
 grade text,
 created_at timestamptz not null default now()
);
create index if not exists courses_user_id_idx on public.courses(user_id);
create table if not exists public.course_materials (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade,
 filename text not null,
 storage_path text not null,
 mime_type text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.tutor_conversations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid references public.courses(id) on delete set null,
 title text not null default 'New conversation',
 created_at timestamptz not null default now()
);
create table if not exists public.tutor_messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('user','assistant')),
 content text not null,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_materials enable row level security;
alter table public.tutor_conversations enable row level security;
alter table public.tutor_messages enable row level security;
create policy "Own profile" on public.profiles for all to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "Own courses" on public.courses for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Own course materials" on public.course_materials for all to authenticated using ((select auth.uid())=user_id AND EXISTS(select 1 from public.courses c where c.id=course_id and c.user_id=(select auth.uid()))) with check ((select auth.uid())=user_id AND EXISTS(select 1 from public.courses c where c.id=course_id and c.user_id=(select auth.uid())));
create policy "Own conversations" on public.tutor_conversations for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id AND (course_id is null OR EXISTS(select 1 from public.courses c where c.id=course_id and c.user_id=(select auth.uid()))));
create policy "Own messages" on public.tutor_messages for all to authenticated using ((select auth.uid())=user_id AND EXISTS(select 1 from public.tutor_conversations c where c.id=conversation_id and c.user_id=(select auth.uid()))) with check ((select auth.uid())=user_id AND EXISTS(select 1 from public.tutor_conversations c where c.id=conversation_id and c.user_id=(select auth.uid())));
