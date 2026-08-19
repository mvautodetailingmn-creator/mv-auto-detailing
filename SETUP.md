# Booking System Setup Guide

This explains, step by step, everything you need to do to get online booking
working — assuming no prior experience. It should take about 20–30 minutes
the first time.

## What was added

- **A booking flow** on the homepage (`#booking` section) — service → vehicle
  type → date/time → your info → review → confirmation.
- **A database** (Supabase — a free, hosted Postgres database) that stores
  every booking and enforces business rules so two customers can never book
  the same slot.
- **An admin dashboard** at `/admin` — password-protected — where you view
  upcoming appointments, cancel/complete them, block off dates or times, and
  change your business hours.
- One new package: `@supabase/supabase-js`, the official library for talking
  to Supabase from the website. It's already installed
  (`npm install @supabase/supabase-js` was run for you).

Nothing about the existing design was changed — same colors, fonts, layout,
and sections. The booking section was added between "Services" and "About",
and it reuses the same glass-card look as the rest of the site.

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free — no credit
   card needed for this).
2. Click **New Project**.
   - Name it whatever you like, e.g. `mv-auto-detailing`.
   - Set a database password — Supabase generates one for you; save it
     somewhere safe (a password manager). You won't need it for the steps
     below, but it's good to have.
   - Pick the region closest to you (e.g. one in the US).
3. Wait ~1–2 minutes for the project to finish setting up.

## 2. Create the database tables

1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` in this project, copy its entire
   contents, and paste it into the SQL editor.
4. Click **Run**.

You should see "Success. No rows returned." This created:
- A `bookings` table (every appointment).
- A `blocked_slots` table (dates/times you've manually closed).
- A `business_settings` table (your hours — one row, editable from the
  admin dashboard).
- Two functions the website uses (`get_booked_times`, `create_booking`) and
  the security rules that protect them (see "How this stays secure" below).

If you ever need to reset and re-run it, it's safe — the script won't error
or duplicate anything on a second run.

## 3. Get your API keys

1. In Supabase, go to **Settings** (gear icon) → **API**.
2. You'll see:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string under "Project API keys"
3. Keep this tab open — you'll paste both into `.env` next.

⚠️ There is also a **service_role** key on that same page. **Never use that
one in the website.** It bypasses all security rules. The site only ever
uses the `anon public` key, which is safe to expose (see below).

## 4. Configure environment variables

1. In the project folder, copy `.env.example` to a new file named `.env`
   (same folder, next to `package.json`).
2. Open `.env` and fill in the two values from step 3:

   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

3. Save the file. `.env` is already excluded from git (see `.gitignore`), so
   it will never get committed or pushed to GitHub.

## 5. Create your admin login

There's no public sign-up page for admin — you create your one login
directly in Supabase:

1. In Supabase, go to **Authentication** → **Users**.
2. Click **Add user** → **Create new user**.
3. Enter the email and password you want to use to log into `/admin`.
4. Turn **Auto Confirm User** on (so you don't need to click an email
   confirmation link), then create the user.

That's it — that email/password now works at `/admin` on your site.

## 6. Run the website locally

```bash
npm install      # only needed if you haven't already
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). The site should
look exactly like before, plus a new "Book Now" link in the nav.

## 7. Test a booking end to end

1. Click **Book Now** (or "Book Your Detail").
2. Pick a service, then a vehicle type.
3. Pick a date — you should only see times between your configured business
   hours (9:00 AM–1:00 PM by default), and only future dates.
4. Pick a time, fill in your info, and review.
5. Click **Confirm Booking** — you should see the "Booking Confirmed!"
   screen.
6. Go to `http://localhost:5173/admin`, log in with the account from step 5,
   and confirm the appointment shows up under **Appointments → Upcoming**.
7. Try booking that exact same date/time again in a second browser tab —
   it should no longer appear as an available time, because the slot is
   now taken.

If something goes wrong, the booking screen shows a plain-English error
message (not a blank page or a crash) — e.g. "That time was just booked by
someone else."

## 8. Deploying the updated site

This project already has config files for two beginner-friendly free hosts;
pick one.

### Option A: Netlify (recommended)

1. Push your changes to GitHub (`git add -A`, `git commit`, `git push` —
   your repo is already connected to
   `github.com/mvautodetailingmn-creator/mv-auto-detailing`).
2. At [netlify.com](https://netlify.com), sign up, then **Add new site →
   Import an existing project**, and pick your GitHub repo.
3. Build settings should auto-detect (build command `npm run build`, publish
   directory `dist`) — leave them as suggested.
4. Before deploying, add your environment variables: **Site configuration →
   Environment variables** → add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` with the same values from your `.env`.
5. Deploy. The included `public/_redirects` file makes sure `/admin` works
   correctly on refresh.

### Option B: Vercel

Same idea — import the GitHub repo at [vercel.com](https://vercel.com), add
the two environment variables under **Settings → Environment Variables**,
and deploy. The included `vercel.json` handles the `/admin` route.

(GitHub Pages isn't a good fit here since it doesn't support the kind of
redirect `/admin` needs without extra workarounds — Netlify or Vercel are
both free and simpler for this project.)

---

## Changing things later

- **Business hours / days closed** — Admin dashboard → **Business Hours**
  tab. No code changes or redeploys needed; it updates the database
  directly and takes effect immediately.
- **Blocking a vacation day or a single time slot** — Admin dashboard →
  **Blocked Dates & Times** tab.
- **Prices/services shown in both the pricing section and the booking
  flow** — edit `src/data/services.js`. That file is the single source of
  truth for both.

## How this stays secure

- The `anon` key in `.env` is meant to be public — it identifies your
  project, it doesn't grant access by itself. Supabase's **Row Level
  Security**, defined in `supabase/schema.sql`, is what actually controls
  access:
  - Anyone can see business hours and blocked times (nothing private there).
  - Anyone can submit a booking, but only through a database function that
    validates everything server-side (real service, real date/time, within
    hours, not already taken).
  - Only someone logged in as you (via Supabase Auth) can read customer
    details, cancel/complete bookings, or change settings.
- Two people can never book the same slot: on top of the checks above, the
  database has a hard uniqueness rule on (date, time) for active bookings.
  If two requests race each other, the database itself rejects the second
  one — this doesn't depend on the website's frontend code at all.
- The **service_role** key and your database password are never used in
  the website's code — keep them out of anything you commit or deploy.

## Adding email/SMS confirmations later

The system is set up so this is a small addition later, not a rebuild:

- `create_booking()` in `supabase/schema.sql` is the one place every booking
  passes through — a natural hook point.
- The straightforward beginner-friendly path: create a **Supabase Database
  Webhook** (Database → Webhooks in the dashboard) that fires on `INSERT`
  into `bookings`, pointing at a small **Supabase Edge Function** that calls
  an email service (e.g. Resend) or SMS service (e.g. Twilio) with the
  booking details.
- This wasn't built now since it needs a separate email/SMS provider
  account and API key — happy to wire it up once you've picked one.
