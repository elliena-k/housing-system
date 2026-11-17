-- Initial schema for the Housing Allocation and Management System.
-- Derived from the project report section 4.3. Additions are marked [Addition].

create extension if not exists pgcrypto;

-- Enumerated values ---------------------------------------------------------

create type user_role as enum ('student', 'admin');
create type application_status as enum ('pending', 'approved', 'rejected', 'allocated', 'cancelled');
create type room_status as enum ('available', 'occupied', 'maintenance');
create type hostel_status as enum ('active', 'inactive');
create type allocation_status as enum ('active', 'cancelled');

-- Tables --------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles (id) on delete cascade,
  matric_no text not null unique,
  first_name text not null,
  last_name text not null,
  gender text not null check (gender in ('male', 'female')),
  faculty text not null,
  department text not null,
  level int not null check (level in (100, 200, 300, 400, 500, 600)),
  phone text,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text,
  capacity int check (capacity is null or capacity > 0),
  gender_type text not null default 'mixed' check (gender_type in ('male', 'female', 'mixed')),
  status hostel_status not null default 'active',
  created_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references hostels (id) on delete restrict,
  room_number text not null,
  capacity int not null check (capacity > 0),
  occupancy int not null default 0,
  status room_status not null default 'available',
  created_at timestamptz not null default now(),
  unique (hostel_id, room_number),
  check (occupancy >= 0 and occupancy <= capacity)
);

create table housing_applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  session text not null,
  preference text,
  status application_status not null default 'pending',
  remarks text,
  application_date date not null default current_date,
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  unique (student_id, session)
);

create table allocations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id),
  application_id uuid not null unique references housing_applications (id),
  hostel_id uuid not null references hostels (id),
  room_id uuid not null references rooms (id),
  allocation_date timestamptz not null default now(),
  status allocation_status not null default 'active',
  allocated_by uuid references profiles (id)
);

-- A student can hold only one active allocation.
create unique index one_active_allocation_per_student
  on allocations (student_id)
  where status = 'active';

create table audit_logs (
  id bigserial primary key,
  actor_id uuid references profiles (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index on housing_applications (status, session);
create index on rooms (hostel_id, status);

-- Maintain updated_at on students.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger students_set_updated_at
before update on students
for each row execute function set_updated_at();

-- Allocation ----------------------------------------------------------------
-- Row locks close the race where two administrators allocate the last bed.

create or replace function allocate_room(
  p_application_id uuid,
  p_room_id uuid,
  p_admin_id uuid
) returns allocations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app housing_applications;
  v_room rooms;
  v_hostel hostels;
  v_stud students;
  v_alloc allocations;
begin
  select * into v_app from housing_applications where id = p_application_id for update;
  if not found then raise exception 'APPLICATION_NOT_FOUND'; end if;
  if v_app.status <> 'approved' then raise exception 'APPLICATION_NOT_APPROVED'; end if;

  select * into v_room from rooms where id = p_room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.status <> 'available' or v_room.occupancy >= v_room.capacity then
    raise exception 'ROOM_UNAVAILABLE';
  end if;

  select * into v_hostel from hostels where id = v_room.hostel_id;
  if v_hostel.status <> 'active' then raise exception 'HOSTEL_INACTIVE'; end if;

  select * into v_stud from students where id = v_app.student_id;
  if v_hostel.gender_type <> 'mixed' and v_hostel.gender_type <> v_stud.gender then
    raise exception 'GENDER_MISMATCH';
  end if;

  insert into allocations (student_id, application_id, hostel_id, room_id, allocated_by)
  values (v_app.student_id, v_app.id, v_room.hostel_id, v_room.id, p_admin_id)
  returning * into v_alloc;

  update rooms
  set occupancy = occupancy + 1,
      status = case when occupancy + 1 >= capacity then 'occupied' else status end
  where id = v_room.id;

  update housing_applications
  set status = 'allocated', reviewed_by = p_admin_id, reviewed_at = now()
  where id = v_app.id;

  insert into audit_logs (actor_id, action, entity, entity_id, details)
  values (
    p_admin_id,
    'room.allocated',
    'allocation',
    v_alloc.id,
    jsonb_build_object('room_id', v_room.id, 'student_id', v_app.student_id)
  );

  return v_alloc;
end;
$$;

create or replace function cancel_allocation(
  p_allocation_id uuid,
  p_admin_id uuid
) returns allocations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alloc allocations;
  v_room rooms;
begin
  select * into v_alloc from allocations where id = p_allocation_id for update;
  if not found then raise exception 'ALLOCATION_NOT_FOUND'; end if;
  if v_alloc.status <> 'active' then raise exception 'ALLOCATION_NOT_ACTIVE'; end if;

  select * into v_room from rooms where id = v_alloc.room_id for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;

  update allocations set status = 'cancelled' where id = v_alloc.id returning * into v_alloc;

  update rooms
  set occupancy = greatest(occupancy - 1, 0),
      status = 'available'
  where id = v_room.id;

  update housing_applications
  set status = 'approved'
  where id = v_alloc.application_id;

  insert into audit_logs (actor_id, action, entity, entity_id, details)
  values (
    p_admin_id,
    'allocation.cancelled',
    'allocation',
    v_alloc.id,
    jsonb_build_object('room_id', v_room.id, 'student_id', v_alloc.student_id)
  );

  return v_alloc;
end;
$$;

revoke execute on function allocate_room(uuid, uuid, uuid) from public, anon, authenticated;
revoke execute on function cancel_allocation(uuid, uuid) from public, anon, authenticated;
grant execute on function allocate_room(uuid, uuid, uuid) to service_role;
grant execute on function cancel_allocation(uuid, uuid) to service_role;

-- Row Level Security --------------------------------------------------------
-- The API uses the service role. These policies protect direct client access.

alter table profiles enable row level security;
alter table students enable row level security;
alter table hostels enable row level security;
alter table rooms enable row level security;
alter table housing_applications enable row level security;
alter table allocations enable row level security;
alter table audit_logs enable row level security;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create policy "profiles read own or admin" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "students read own or admin" on students
  for select using (user_id = auth.uid() or is_admin());

create policy "hostels readable by authenticated" on hostels
  for select to authenticated using (true);

create policy "rooms readable by authenticated" on rooms
  for select to authenticated using (true);

create policy "applications read own or admin" on housing_applications
  for select using (
    student_id in (select id from students where user_id = auth.uid()) or is_admin()
  );

create policy "allocations read own or admin" on allocations
  for select using (
    student_id in (select id from students where user_id = auth.uid()) or is_admin()
  );
