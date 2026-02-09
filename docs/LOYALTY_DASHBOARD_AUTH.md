# Loyalty Dashboard – SSO from Business Dashboard

When a user clicks **"Loyalty Dashboard"** in the Business Dashboard sidebar, they are sent to the Loyalty Dashboard URL **with the current JWT in the URL hash** so they land already authenticated (no separate login).

## How it works

1. **Business Dashboard** (this app) builds the link as:
   ```
   <LOYALTY_DASHBOARD_URL>#token=<JWT>
   ```
   The link opens in a new tab (`target="_blank"`).

2. **Loyalty Dashboard** (your frontend) must, on load:
   - Read the token from the hash.
   - Store it for API calls (e.g. cookie, localStorage, or memory).
   - Remove the token from the URL so it is not visible in the address bar or history.

## What the Loyalty Dashboard should do on load

Run this (or equivalent) as early as possible in your app bootstrap (e.g. in `main.tsx` or your auth provider):

```javascript
// 1. Parse hash: #token=eyJhbGc...
const hash = window.location.hash?.slice(1) || '';
const params = new URLSearchParams(hash);
const token = params.get('token');

if (token) {
  // 2. Store the token the same way your app expects it (e.g. same cookie name as Business Dashboard)
  // Option A: Cookie (so your API client can use credentials: 'include' or same cookie)
  document.cookie = `jwt=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

  // Option B: Or use js-cookie / localStorage / Redux – whatever your Loyalty app uses for auth.
  // localStorage.setItem('jwt', token);

  // 3. Remove token from URL (security & cleanliness)
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
