create extension if not exists pgcrypto;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid() and is_active = true),
    'readonly'
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text not null default '',
  role text not null default 'member' check (role in ('owner', 'member', 'readonly')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.consumables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '',
  specification text not null default '',
  unit text not null default '件',
  quantity numeric not null default 0,
  min_quantity numeric not null default 0,
  location text not null default '',
  supplier text not null default '',
  remark text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  asset_no text not null unique,
  name text not null,
  model text not null default '',
  owner text not null default '',
  status text not null default '在用',
  location text not null default '',
  purchase_date text not null default '',
  price numeric not null default 0,
  remark text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_records (
  id uuid primary key default gen_random_uuid(),
  item_type text not null default 'consumable',
  item_id uuid not null references public.consumables(id) on delete cascade,
  action text not null check (action in ('inbound', 'checkout')),
  quantity numeric not null check (quantity > 0),
  operator_id uuid not null references public.profiles(id),
  borrower text not null default '',
  purpose text not null default '',
  remark text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.consumables enable row level security;
alter table public.equipment enable row level security;
alter table public.stock_records enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_owner_or_self" on public.profiles;
create policy "profiles_update_owner_or_self"
on public.profiles for update
to authenticated
using (public.current_user_role() = 'owner' or id = auth.uid())
with check (public.current_user_role() = 'owner' or id = auth.uid());

drop policy if exists "consumables_select_authenticated" on public.consumables;
create policy "consumables_select_authenticated"
on public.consumables for select
to authenticated
using (true);

drop policy if exists "consumables_write_owner_member" on public.consumables;
create policy "consumables_write_owner_member"
on public.consumables for all
to authenticated
using (public.current_user_role() in ('owner', 'member'))
with check (public.current_user_role() in ('owner', 'member'));

drop policy if exists "equipment_select_authenticated" on public.equipment;
create policy "equipment_select_authenticated"
on public.equipment for select
to authenticated
using (true);

drop policy if exists "equipment_write_owner_member" on public.equipment;
create policy "equipment_write_owner_member"
on public.equipment for all
to authenticated
using (public.current_user_role() in ('owner', 'member'))
with check (public.current_user_role() in ('owner', 'member'));

drop policy if exists "records_select_authenticated" on public.stock_records;
create policy "records_select_authenticated"
on public.stock_records for select
to authenticated
using (true);

drop policy if exists "records_insert_owner_member" on public.stock_records;
create policy "records_insert_owner_member"
on public.stock_records for insert
to authenticated
with check (public.current_user_role() in ('owner', 'member') and operator_id = auth.uid());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists consumables_set_updated_at on public.consumables;
create trigger consumables_set_updated_at
before update on public.consumables
for each row execute function public.set_updated_at();

drop trigger if exists equipment_set_updated_at on public.equipment;
create trigger equipment_set_updated_at
before update on public.equipment
for each row execute function public.set_updated_at();

create or replace function public.apply_stock_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_qty numeric;
begin
  select quantity into current_qty from public.consumables where id = new.item_id for update;
  if current_qty is null then
    raise exception '耗材不存在';
  end if;

  if new.action = 'inbound' then
    update public.consumables set quantity = quantity + new.quantity where id = new.item_id;
  elsif new.action = 'checkout' then
    if current_qty < new.quantity then
      raise exception '库存不足';
    end if;
    update public.consumables set quantity = quantity - new.quantity where id = new.item_id;
  end if;
  return new;
end;
$$;

drop trigger if exists stock_records_apply on public.stock_records;
create trigger stock_records_apply
after insert on public.stock_records
for each row execute function public.apply_stock_record();
