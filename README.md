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

The IPC registration form writes to Supabase. Create a Supabase project, run `integrations/supabase-registration.sql` in its SQL Editor, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` and the Vercel project environment variables. These client-side values are public; never put a Supabase secret or service-role key in the frontend. Row-level security permits anonymous inserts only, so public visitors cannot read or edit registration records. After a registration is saved, the app calls the `send-registration-confirmation` Supabase Edge Function to send a receipt through Brevo. The newsletter form calls the `newsletter-subscribe` Supabase Edge Function, which adds new contacts to Mailchimp with pending status so they must confirm by email. The Mailchimp API key stays server-side. Other contact actions open the email dialog.

To deploy the newsletter function, install the [Supabase CLI](https://supabase.com/docs/guides/cli), open a terminal in this project folder, then sign in and link the project:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

In the Supabase Dashboard, open **Edge Functions → Secrets** and add `MAILCHIMP_API_KEY` and `MAILCHIMP_AUDIENCE_ID`. Then deploy the function from the project folder:

```sh
supabase functions deploy newsletter-subscribe
```

The function is defined in `supabase/functions/newsletter-subscribe/index.ts`; deployment publishes it to your linked Supabase project.

For IPC registration confirmation emails, verify a sender address or domain in Brevo, then add `BREVO_API_KEY`, `REGISTRATION_FROM_EMAIL` (the verified sender address), and optionally `REGISTRATION_FROM_NAME` to **Supabase Dashboard → Edge Functions → Secrets**. Deploy the function from this project folder:

```sh
npx supabase functions deploy send-registration-confirmation
```

The function is defined in `supabase/functions/send-registration-confirmation/index.ts`. The Brevo API key must remain a Supabase secret; do not add it to Vercel or a `VITE_` variable.

Flutterwave payments use `supabase/functions/verify-payment` to verify completed transactions. Set the live `FLUTTERWAVE_SECRET_KEY` as a Supabase Function secret, then deploy with `npx supabase functions deploy verify-payment`. Set `VITE_PAYMENT_VERIFY_URL` to `https://<project-ref>.supabase.co/functions/v1/verify-payment` and `VITE_FLUTTERWAVE_PUBLIC_KEY` to the live Flutterwave public key in Vercel (and `.env.local` for local work). The verification function accepts public requests and checks each transaction server-side against Flutterwave; the secret key must stay in Supabase Function secrets.

The countdown calculates the next Monday at 11 PM in West Africa Time (UTC+1), rather than retaining the expired example date from Figma.
