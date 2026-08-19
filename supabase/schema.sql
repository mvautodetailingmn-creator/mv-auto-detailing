-- ============================================================================
-- MV Auto Detailing — booking system database schema
--
-- HOW TO USE THIS FILE:
-- 1. Go to your Supabase project → SQL Editor → New query.
-- 2. Paste this entire file in and click "Run".
-- 3. That's it — this creates all tables, security rules, and the two
--    functions the website uses to check availability and create bookings.
--
-- Safe to re-run: every statement uses "if not exists" / "or replace" /
-- "drop policy if exists" so running this again won't error or duplicate data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. business_settings — one row that holds your configurable business hours.
--    Editable later from the admin dashboard, no code changes needed.
-- ----------------------------------------------------------------------------
create table if not exists business_settings (
  id int primary key default 1,
  start_time time not null default '09:00',       -- earliest bookable start time
  last_start_time time not null default '13:00',   -- latest bookable start time
  slot_interval_minutes int not null default 60,   -- spacing between time slots
  closed_weekdays int[] not null default '{0}',    -- 0=Sunday .. 6=Saturday
  updated_at timestamptz not null default now(),
  constraint business_settings_single_row check (id = 1)
);

insert into business_settings (id) values (1)
  on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. blocked_slots — dates/times you manually close off (vacation, personal
--    time, etc). blocked_time = null means the entire day is blocked.
-- ----------------------------------------------------------------------------
create table if not exists blocked_slots (
  id uuid primary key default gen_random_uuid(),
  blocked_date date not null,
  blocked_time time,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists blocked_slots_date_idx on blocked_slots (blocked_date);

-- ----------------------------------------------------------------------------
-- 3. bookings — the appointments themselves.
-- ----------------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  vehicle_year text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_type text not null,
  service_name text not null,
  service_price text,
  address text not null,
  notes text,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'completed', 'cancelled'))
);

-- This is the key protection against double-booking: Postgres will not allow
-- two non-cancelled rows with the same date + time to exist, no matter how
-- the row got inserted or how many requests arrive at the same instant.
create unique index if not exists bookings_unique_active_slot
  on bookings (appointment_date, appointment_time)
  where status <> 'cancelled';

create index if not exists bookings_date_idx on bookings (appointment_date);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
--
-- The website's frontend uses a public "anon" key. RLS is what makes that
-- safe: it's the database itself enforcing who can read/write what, so the
-- key being public doesn't mean your data is public.
--
--   - Anyone (anon)       can READ business hours + blocked slots (no
--                          personal info in those tables).
--   - Anyone (anon)       can call the two functions below to check
--                          available times and submit a booking — but
--                          cannot read, edit, or delete bookings directly.
--   - Logged-in admin     (Supabase Auth) can read/update bookings, manage
--                          blocked slots, and edit business hours.
-- ----------------------------------------------------------------------------
alter table business_settings enable row level security;
alter table blocked_slots enable row level security;
alter table bookings enable row level security;

drop policy if exists "Public can view business settings" on business_settings;
create policy "Public can view business settings"
  on business_settings for select
  using (true);

drop policy if exists "Admin can update business settings" on business_settings;
create policy "Admin can update business settings"
  on business_settings for update
  using (auth.role() = 'authenticated');

drop policy if exists "Public can view blocked slots" on blocked_slots;
create policy "Public can view blocked slots"
  on blocked_slots for select
  using (true);

drop policy if exists "Admin can manage blocked slots" on blocked_slots;
create policy "Admin can manage blocked slots"
  on blocked_slots for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Deliberately no public select/insert policy on bookings. Reads are
-- admin-only, and inserts happen only through create_booking() below.
drop policy if exists "Admin can view bookings" on bookings;
create policy "Admin can view bookings"
  on bookings for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can update bookings" on bookings;
create policy "Admin can update bookings"
  on bookings for update
  using (auth.role() = 'authenticated');

drop policy if exists "Admin can delete bookings" on bookings;
create policy "Admin can delete bookings"
  on bookings for delete
  using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 4. get_booked_times(date) — lets the booking page find out which times on
--    a given day are already taken, WITHOUT exposing any customer's name,
--    phone, email, or address. Only the time itself comes back.
-- ----------------------------------------------------------------------------
create or replace function get_booked_times(p_date date)
returns table(appointment_time time)
language sql
security definer
set search_path = public
as $$
  select appointment_time
  from bookings
  where appointment_date = p_date
    and status <> 'cancelled';
$$;

grant execute on function get_booked_times(date) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. validate_appointment_slot(date, time) — the availability rules shared
--    by create_booking() and reschedule_customer_booking() below, factored
--    out so both stay in sync: no past dates, within business hours, on a
--    valid interval, day/time not blocked. Raises a plain-English exception
--    on the first rule that fails.
-- ----------------------------------------------------------------------------
create or replace function validate_appointment_slot(p_date date, p_time time)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings business_settings;
  v_weekday int;
  v_minutes_from_start int;
begin
  if p_date < current_date then
    raise exception 'That date is in the past. Please choose another date.';
  end if;

  select * into v_settings from business_settings where id = 1;

  v_weekday := extract(dow from p_date);
  if v_weekday = any(v_settings.closed_weekdays) then
    raise exception 'MV Auto Detailing is closed on that day. Please choose another date.';
  end if;

  if p_time < v_settings.start_time or p_time > v_settings.last_start_time then
    raise exception 'That time is outside business hours.';
  end if;

  v_minutes_from_start := extract(epoch from (p_time - v_settings.start_time)) / 60;
  if v_minutes_from_start % v_settings.slot_interval_minutes <> 0 then
    raise exception 'That is not a valid appointment time.';
  end if;

  if exists (
    select 1 from blocked_slots
    where blocked_date = p_date and blocked_time is null
  ) then
    raise exception 'That date is unavailable. Please choose another date.';
  end if;

  if exists (
    select 1 from blocked_slots
    where blocked_date = p_date and blocked_time = p_time
  ) then
    raise exception 'That time is unavailable. Please choose another time.';
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. create_booking(...) — the only way a new appointment can be inserted.
--    Re-validates everything on the server (never trust the frontend alone):
--    required fields, then the shared slot rules above. The unique index
--    above is the final backstop — if two people submit the same slot at
--    the exact same moment, the second insert fails and the customer sees a
--    clear message.
-- ----------------------------------------------------------------------------
create or replace function create_booking(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_vehicle_year text,
  p_vehicle_make text,
  p_vehicle_model text,
  p_vehicle_type text,
  p_service_name text,
  p_service_price text,
  p_address text,
  p_notes text,
  p_appointment_date date,
  p_appointment_time time
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_id uuid;
begin
  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'Name is required';
  end if;
  if coalesce(trim(p_customer_phone), '') = '' then
    raise exception 'Phone number is required';
  end if;
  if coalesce(trim(p_customer_email), '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'A valid email is required';
  end if;
  if coalesce(trim(p_address), '') = '' then
    raise exception 'Service address is required';
  end if;
  if coalesce(trim(p_service_name), '') = '' then
    raise exception 'Please select a service';
  end if;
  if coalesce(trim(p_vehicle_year), '') = ''
     or coalesce(trim(p_vehicle_make), '') = ''
     or coalesce(trim(p_vehicle_model), '') = '' then
    raise exception 'Vehicle year, make, and model are required';
  end if;

  perform validate_appointment_slot(p_appointment_date, p_appointment_time);

  insert into bookings (
    customer_name, customer_phone, customer_email,
    vehicle_year, vehicle_make, vehicle_model, vehicle_type,
    service_name, service_price, address, notes,
    appointment_date, appointment_time, status
  ) values (
    trim(p_customer_name), trim(p_customer_phone), trim(p_customer_email),
    trim(p_vehicle_year), trim(p_vehicle_make), trim(p_vehicle_model), trim(p_vehicle_type),
    trim(p_service_name), nullif(trim(p_service_price), ''), trim(p_address), nullif(trim(p_notes), ''),
    p_appointment_date, p_appointment_time, 'confirmed'
  )
  returning id into v_new_id;

  return v_new_id;
exception
  when unique_violation then
    raise exception 'Sorry, that time was just booked by someone else. Please choose another time.';
end;
$$;

grant execute on function create_booking(
  text, text, text, text, text, text, text, text, text, text, text, date, time
) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 7. Self-service cancel / reschedule for customers.
--
-- There's no customer login, so a customer proves a booking is theirs by
-- supplying the same email + phone + date they booked with — all three
-- must match. This mirrors a common "guest order lookup" pattern: enough
-- to stop casual guessing, without requiring an account system.
--
-- find_customer_booking_id() is the shared, internal matching logic used
-- by all three functions below so the matching rule only lives in one
-- place. Only 'confirmed' bookings are ever matched — once cancelled or
-- completed, a booking is no longer self-manageable.
-- ----------------------------------------------------------------------------
create or replace function find_customer_booking_id(
  p_email text,
  p_phone text,
  p_appointment_date date
)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from bookings
  where status = 'confirmed'
    and appointment_date = p_appointment_date
    and lower(trim(customer_email)) = lower(trim(p_email))
    and regexp_replace(customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  limit 1;
$$;

-- Customers can only change a booking up to 24 hours before it starts —
-- the same policy shown on the website's FAQ. Shared by cancel/reschedule.
create or replace function assert_booking_changeable(p_booking bookings)
returns void
language plpgsql
as $$
begin
  if (p_booking.appointment_date + p_booking.appointment_time)::timestamp <= now() + interval '24 hours' then
    raise exception 'This appointment is less than 24 hours away and can no longer be changed online. Please contact us directly.';
  end if;
end;
$$;

-- find_customer_booking(...) — looks up a booking for display before the
-- customer decides to cancel or reschedule it. Returns zero rows (not an
-- error) when nothing matches, so the frontend can show a plain "we
-- couldn't find that booking" message instead of a scary error.
create or replace function find_customer_booking(
  p_email text,
  p_phone text,
  p_appointment_date date
)
returns table(
  id uuid,
  customer_name text,
  service_name text,
  service_price text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  vehicle_type text,
  appointment_date date,
  appointment_time time,
  address text
)
language sql
security definer
set search_path = public
stable
as $$
  select b.id, b.customer_name, b.service_name, b.service_price,
         b.vehicle_year, b.vehicle_make, b.vehicle_model, b.vehicle_type,
         b.appointment_date, b.appointment_time, b.address
  from bookings b
  where b.id = find_customer_booking_id(p_email, p_phone, p_appointment_date);
$$;

grant execute on function find_customer_booking(text, text, date) to anon, authenticated;

-- cancel_customer_booking(...) — cancels the matched booking, freeing its
-- slot for other customers. Raises a clear exception if nothing matches or
-- the 24-hour window has passed.
create or replace function cancel_customer_booking(
  p_email text,
  p_phone text,
  p_appointment_date date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  select * into v_booking
  from bookings
  where id = find_customer_booking_id(p_email, p_phone, p_appointment_date);

  if not found then
    raise exception 'We couldn''t find a booking matching those details.';
  end if;

  perform assert_booking_changeable(v_booking);

  update bookings set status = 'cancelled' where id = v_booking.id;
end;
$$;

grant execute on function cancel_customer_booking(text, text, date) to anon, authenticated;

-- reschedule_customer_booking(...) — moves the matched booking to a new
-- date/time. Re-runs the same availability rules create_booking() uses, so
-- a customer can't reschedule into a closed day, outside business hours,
-- or a blocked/already-booked slot. The unique index is still the final
-- backstop against a race with another customer.
create or replace function reschedule_customer_booking(
  p_email text,
  p_phone text,
  p_appointment_date date,
  p_new_date date,
  p_new_time time
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  select * into v_booking
  from bookings
  where id = find_customer_booking_id(p_email, p_phone, p_appointment_date);

  if not found then
    raise exception 'We couldn''t find a booking matching those details.';
  end if;

  perform assert_booking_changeable(v_booking);
  perform validate_appointment_slot(p_new_date, p_new_time);

  update bookings
  set appointment_date = p_new_date,
      appointment_time = p_new_time
  where id = v_booking.id;
exception
  when unique_violation then
    raise exception 'Sorry, that time was just booked by someone else. Please choose another time.';
end;
$$;

grant execute on function reschedule_customer_booking(text, text, date, date, time) to anon, authenticated;
