-- Roller: member (varsayilan), admin (mac belirler, isimleri gorur), owner (admin atar)
create type public.user_role as enum ('member', 'admin', 'owner');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 50),
  last_name text not null check (char_length(last_name) between 1 and 50),
  email text not null,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now()
);

create table public.availability (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);
create index availability_day_idx on public.availability (day);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  start_time time not null,
  end_time time,
  pitch_name text not null check (char_length(pitch_name) between 1 and 100),
  address text check (char_length(address) <= 200),
  maps_url text check (maps_url is null or maps_url ~* '^https?://'),
  notes text check (char_length(notes) <= 500),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index matches_date_idx on public.matches (match_date);

-- Istanbul saatine gore bugun
create or replace function public.today_tr()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Europe/Istanbul')::date;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'owner')
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- Kayit olunca profil olustur (isim, kayit formundaki metadata'dan gelir)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')),
    trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.availability enable row level security;
alter table public.matches enable row level security;

-- profiles: herkes kendini, adminler herkesi gorur
create policy "profiles_select_self_or_admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- profiles: kullanici sadece kendi isim alanlarini guncelleyebilir (rol degil)
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (first_name, last_name) on public.profiles to authenticated;

-- availability: kullanici kendi kayitlarini, adminler hepsini gorur
create policy "availability_select_self_or_admin" on public.availability
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "availability_insert_self" on public.availability
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and day between (select public.today_tr()) and (select public.today_tr()) + 29
  );

create policy "availability_delete_self" on public.availability
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke update on public.availability from anon, authenticated;
revoke all on public.availability from anon;

-- matches: giris yapan herkes gorur, sadece adminler yazar
create policy "matches_select_authenticated" on public.matches
  for select to authenticated
  using (true);

create policy "matches_insert_admin" on public.matches
  for insert to authenticated
  with check ((select public.is_admin()));

create policy "matches_update_admin" on public.matches
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "matches_delete_admin" on public.matches
  for delete to authenticated
  using ((select public.is_admin()));

revoke all on public.matches from anon;
revoke all on public.profiles from anon;

-- Uyeler isim gormeden gun bazli sayilari alir
create or replace function public.availability_counts(from_day date, to_day date)
returns table (day date, available integer)
language sql
stable
security definer
set search_path = ''
as $$
  select a.day, count(*)::integer
  from public.availability a
  where auth.uid() is not null
    and a.day between from_day and to_day
  group by a.day
  order by a.day;
$$;

create or replace function public.member_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case when auth.uid() is null then 0
    else (select count(*)::integer from public.profiles) end;
$$;

-- Owner, diger kullanicilari admin/member yapar
create or replace function public.set_user_role(target uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_owner() then
    raise exception 'Bu islem icin yetkin yok';
  end if;
  if new_role = 'owner' then
    raise exception 'Owner rolu buradan verilemez';
  end if;
  if target = auth.uid() then
    raise exception 'Kendi rolunu degistiremezsin';
  end if;
  update public.profiles set role = new_role where id = target and role <> 'owner';
end;
$$;

revoke execute on function public.availability_counts(date, date) from public, anon;
revoke execute on function public.member_count() from public, anon;
revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_owner() from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.availability_counts(date, date) to authenticated;
grant execute on function public.member_count() to authenticated;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;
