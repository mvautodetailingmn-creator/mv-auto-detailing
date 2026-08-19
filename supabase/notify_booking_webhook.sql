-- ============================================================================
-- Booking notification trigger
--
-- Calls the send-booking-notification Edge Function whenever a new row is
-- inserted into `bookings`, which emails the owner via Resend. This is the
-- SQL equivalent of a Database Webhook (Database -> Webhooks in the
-- dashboard) for projects where that UI page is hard to find.
--
-- HOW TO USE: paste this whole file into Supabase SQL Editor and click Run.
-- Safe to re-run.
-- ============================================================================

create extension if not exists pg_net;

create or replace function public.notify_new_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://ufvxxwcqudwodptvuryp.supabase.co/functions/v1/send-booking-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '6d526fc7102d521553aab18b9aa4028b1c5b6c884fcf4bd9dd552076bccfeef1'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'bookings',
      'schema', 'public',
      'record', to_jsonb(NEW),
      'old_record', null
    )
  );
  return NEW;
end;
$$;

drop trigger if exists on_booking_created on bookings;
create trigger on_booking_created
  after insert on bookings
  for each row
  execute function public.notify_new_booking();
