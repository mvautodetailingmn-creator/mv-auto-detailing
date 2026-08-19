# MV Auto Detailing

The MV Auto Detailing marketing site, built with React, Vite, and Tailwind
CSS, plus an online booking system backed by Supabase.

## Quick start

```bash
npm install
npm run dev
```

Booking and the `/admin` dashboard need a database connection to work — see
**[SETUP.md](./SETUP.md)** for the full, beginner-friendly walkthrough
(creating the database, environment variables, your admin login, and
deploying). Without it, the rest of the site still works normally; only the
booking section shows a short "not connected yet" message.

## Project structure

- `src/components/` — page sections (Hero, Services, Booking, About,
  Contact, Footer, Navbar).
- `src/components/booking/` — the booking wizard's individual steps.
- `src/admin/` — the password-protected `/admin` dashboard.
- `src/data/services.js` — services, prices, and vehicle types shown in both
  the pricing section and the booking flow (single source of truth).
- `src/lib/` — Supabase client and small date/time helpers.
- `src/hooks/` — data-fetching hooks used by the booking flow and admin.
- `supabase/schema.sql` — the full database schema; paste-and-run in the
  Supabase SQL Editor.

## Scripts

- `npm run dev` — start the local dev server.
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview the production build locally.
- `npm run lint` — run Oxlint.

## React Compiler

The React Compiler is not enabled on this template because of its impact on
dev & build performance. To add it, see [this
documentation](https://react.dev/learn/react-compiler/installation).
