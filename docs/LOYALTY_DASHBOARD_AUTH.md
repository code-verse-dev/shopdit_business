# Loyalty Dashboard – SSO from Business Dashboard

When a user clicks **"Loyalty Dashboard"** in the Business Dashboard sidebar, they are sent to the Loyalty Dashboard URL **with the current JWT in the URL hash** so they land already authenticated (no separate login).

## How it works

1. **Business Dashboard** (this app) builds the link as:
   ```
   <LOYALTY_DASHBOARD_URL>#token=<JWT>&activeProfile=<PROFILE_ID>
   ```
   The link opens in a new tab (`target="_blank"`). `activeProfile` is the currently active business profile ID so the Loyalty Dashboard can show stats for that profile only.

2. **Loyalty Dashboard** (your frontend) must, on load:
   - Read the token and `activeProfile` from the hash.
   - Store the token for API calls (e.g. cookie, localStorage, or memory).
   - Store or use `activeProfile` for all loyalty API calls (so stats and data are scoped to that business profile).
   - Remove the hash from the URL so tokens are not visible in the address bar or history.

## What the Loyalty Dashboard should do on load

Run this (or equivalent) as early as possible in your app bootstrap (e.g. in `main.tsx` or your auth provider):

```javascript
// 1. Parse hash: #token=eyJhbGc...&activeProfile=profileId123
const hash = window.location.hash?.slice(1) || '';
const params = new URLSearchParams(hash);
const token = params.get('token');
const activeProfile = params.get('activeProfile');

if (token) {
  // 2. Store the token the same way your app expects it (e.g. same cookie name as Business Dashboard)
  document.cookie = `jwt=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  // Or: localStorage.setItem('jwt', token);

  // 3. Store activeProfile so your API calls use it (e.g. for stats, loyalty data)
  if (activeProfile) {
    sessionStorage.setItem('activeProfile', activeProfile);
    // Or pass to your auth/context so all API requests include it (e.g. header or query param).
  }

  // 4. Remove hash from URL (security & cleanliness)
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
```

- Use the **same cookie name** (`jwt`) and **same backend API** (and `Authorization: Bearer <token>` if you use headers) so the same backend accepts the token in both apps.
- If your Loyalty app uses **Bearer in headers** instead of cookies, parse the hash as above, store the token in memory/Redux, and attach it to requests the same way the Business Dashboard does.

## Configuring the link (Business Dashboard)

- **Env (recommended):** Set `VITE_LOYALTY_DASHBOARD_URL` in `.env` (e.g. `VITE_LOYALTY_DASHBOARD_URL=https://loyalty.yourdomain.com`). No trailing slash.
- **Fallback:** If the env is not set and the app runs on `localhost`, the sidebar uses `http://localhost:5174` so you can run the Loyalty app on port 5174 for dev.
- **Production:** Set `VITE_LOYALTY_DASHBOARD_URL` to your real Loyalty Dashboard URL so the sidebar points there.

## Same-domain alternative (optional)

If both apps are served under the **same parent domain** (e.g. `business.yourdomain.com` and `loyalty.yourdomain.com`), you can instead:

1. Have the backend set the JWT cookie with `Domain=.yourdomain.com` on login.
2. Open the Loyalty Dashboard with a **plain link** (no hash). The browser will send the cookie to the Loyalty origin, and the Loyalty app can rely on that cookie for authenticated API calls without reading any token from the URL.

The current implementation uses the **hash-based token pass** so it works even when the two frontends are on different origins or cookies are not shared.
