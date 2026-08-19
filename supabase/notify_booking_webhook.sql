-- ============================================================================
-- Booking notification trigger
--
-- Calls the send-booking-notification Edge Function whenever a new row is
-- inserted into `bookings`, which emails the owner via Resend. This is the
-- SQL equivalent of a Database Webhook (Database -> Webhooks in the
-- dashboard) for projects where that UI page is hard to find.
--
-- The shared secret used to authenticate the call to the Edge Function is
-- kept OUT of this file (and out of git) — it lives in Supabase Vault. Set
-- it once via SQL Editor, never commit it:
--
--   select vault.create_secret(
--     'a-long-random-string',
--     'booking_webhook_secret',
--     'Shared secret for the booking notification webhook trigger'
--   );
--
-- The exact same value must also be set as the WEBHOOK_SECRET secret on the
-- send-booking-notification Edge Function (Edge Functions -> that function
-- -> Secrets, or `supabase secrets set WEBHOOK_SECRET=...`).
--
-- HOW TO USE: paste this whole file into Supabase SQL Editor and click Run.
-- Safe to re-run.
-- ============================================================================

create extension if not exists pg_net;
create extension if not exists supabase_vault;

create or replace function public.notify_new_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets
  where name = 'booking_webhook_secret'
  limit 1;

  -- If the secret hasn't been configured yet, skip the notification instead
  -- of failing the booking — the booking itself must never depend on this.
  if v_secret is null then
    return NEW;
  end if;

  perform net.http_post(
    url := 'https://ufvxxwcqudwodptvuryp.supabase.co/functions/v1/send-booking-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', v_secret
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
