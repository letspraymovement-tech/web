# Let’s Pray

React, TypeScript and Vite implementation of the supplied Let’s Pray Figma design. All source and assets live in this project.

## Run

```sh
npm install
npm run dev
```

Use `npm run build` for the production build in `dist/`. Configure static hosting to serve `index.html` for application routes.

## Pages

- `/` — homepage
- `/prayer-sessions` — weekly sessions and joining instructions
- `/IPC2026` — IPC 2026 registration form

## Structure

```text
src/
  components/       Shared UI, countdown, contact dialog and community banner
    layout/         Header and footer
  data/             Design assets and repeated content
  pages/            Home, prayer sessions and IPC registration
  styles/           Shared, layout, page and responsive styles
  App.tsx           Page selection and shared layout
  index.css         Global reset and design tokens
public/assets/      Original locally downloaded Figma images and SVGs
.design/            Reference export and browser verification artifacts
```

## Integration notes

The Figma file uses Tactic Sans Black Italic. A bold italic system fallback is used because the licensed font was unavailable. Typography is centralized in `src/index.css`.

The IPC registration form writes to Supabase. Create a Supabase project, run `integrations/supabase-registration.sql` in its SQL Editor, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` and the Vercel project environment variables. These client-side values are public; never put a Supabase secret or service-role key in the frontend. Row-level security permits anonymous inserts only, so public visitors cannot read or edit registration records. Registration confirmation emails need a separate email provider or server-side function. The newsletter form calls the `newsletter-subscribe` Supabase Edge Function, which adds new contacts to Mailchimp with pending status so they must confirm by email. Set the Supabase Function secrets `MAILCHIMP_API_KEY` and `MAILCHIMP_AUDIENCE_ID`, then deploy it with `supabase functions deploy newsletter-subscribe`. The Mailchimp API key stays server-side. Other contact actions open the email dialog.

Flutterwave payments use `supabase/functions/verify-payment` to verify completed transactions. Set `FLUTTERWAVE_SECRET_KEY` as a Supabase Function secret, deploy with `supabase functions deploy verify-payment`, and set `VITE_PAYMENT_VERIFY_URL` to `https://<project-ref>.supabase.co/functions/v1/verify-payment` locally and in Vercel. Keep `VITE_FLUTTERWAVE_PUBLIC_KEY` as the Flutterwave public key. The Supabase publishable key and payment verification URL are public; the Flutterwave secret key must stay in Supabase Function secrets.

The countdown calculates the next Monday at 11 PM in West Africa Time (UTC+1), rather than retaining the expired example date from Figma.
