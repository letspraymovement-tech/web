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
- `/ipc` — IPC 2026 registration form

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

Community invitations, social destinations, giving details and submission APIs were not supplied. Those calls to action currently open a contact dialog with the email shown in the design. Newsletter and registration forms prepare email drafts; they do not save records or claim successful registration. Replace these with the real invitation links and submission services before launch. No form data is stored in the browser.

The countdown calculates the next Monday at 11 PM in West Africa Time (UTC+1), rather than retaining the expired example date from Figma.
