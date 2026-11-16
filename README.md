# RasmReady

Shared wedding planning with Firebase Email/Password accounts and real-time,
wedding-scoped Firestore data.

## Run locally

Use Node.js 22 or 24, then run:

```sh
npm ci
npm run dev
```

The Firebase web configuration is in `firebase-applet-config.json`. It contains
public client identifiers, not server credentials. Never put service-account
keys or private credentials in client files or `VITE_` environment variables.

## Firebase setup for live use

1. In the Firebase console for the configured project, enable
   **Authentication > Sign-in method > Email/Password**.
2. Add the deployed app's domain (and `localhost` for local development) to
   **Authentication > Settings > Authorized domains**.
3. Use the `rasmready` Firebase project and its `(default)` Firestore database.
   `firebase-applet-config.json` and `firebase.json` target that same database.
4. Sign in with an account authorized to manage that project and deploy the rules:

   ```sh
   npx firebase login
   npx firebase deploy --only firestore:rules --project rasmready
   ```

These are real accounts: preset demo personas no longer sign users in. Email/password
and Google sign-in are supported; enable Google under Authentication's sign-in
providers when configuring a new Firebase project. Register
as a bride or groom to create a wedding, or as a family member to accept a private
invitation. An existing account can create additional weddings from the wedding
switcher. Keep invitation codes private; anyone signed in with the code can join
as a collaborator, but cannot become an administrator.

Planning records live under `weddings/{weddingId}`. Memberships authorize access
on the server; only wedding administrators can edit wedding details. Browser
storage is used only for UI preferences. Previous local-demo records are left
untouched in browser storage and are not automatically uploaded to an account.

Firestore limits individual documents to 1 MiB. Album uploads are limited to
small images; larger files must be resized before adding them.

## Public hosting

The production site uses GitHub Pages at
https://ketkifadnavis.github.io/RasmReady/.

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, builds the app with
the `/RasmReady/` base path, and deploys to GitHub Pages. Pages must use
**GitHub Actions** as its source in the repository settings.

Add `ketkifadnavis.github.io` to Firebase Authentication's authorized domains.
The hosted app uses real Firebase accounts and the `(default)` database in
the `rasmready` project.

Deploy Firestore rules separately using the setup command above when they change.

## Checks

```sh
npm run lint
npm run build
npm run test:firebase
npx playwright install chromium
npm run test:app
```

The Firebase checks need Java 21 or later. They start isolated Authentication and
Firestore emulators for `demo-rasmready` and do not write to the live project.
The browser checks cover account registration/sign-in and errors, invitation
validation, concurrent family edits, wedding isolation, wedding details and local
times, planning CRUD and filters, vendor/budget sync, guest logistics, checklists,
photos, PDF downloads, clipboard denial, offline write recovery, and mobile
navigation at 360px and 390px. External WhatsApp messages are not sent.
To use an installed Google Chrome instead of downloading Chromium, run
`PLAYWRIGHT_CHROMIUM_CHANNEL=chrome npm run test:app`.
Set `VITE_BASE_PATH=/RasmReady/` on the same command to also exercise the
production subdirectory layout and invitation links.

For manual emulator development, start:

```sh
npx firebase emulators:start --project demo-rasmready --config firebase.emulators.json --only auth,firestore
```

In another terminal:

```sh
VITE_FIREBASE_EMULATOR_HOST=127.0.0.1 npm run dev
```

Leave `VITE_FIREBASE_EMULATOR_HOST` unset for live builds.
