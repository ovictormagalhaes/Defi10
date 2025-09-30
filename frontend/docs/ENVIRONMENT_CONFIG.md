# Frontend Environment Configuration

The frontend resolves the API base URL in the following precedence order (first match wins):

1. `window.__API_BASE__` (runtime global override for static deployments)
2. `VITE_API_BASE_URL` (preferred build-time env var)
3. Legacy vars: `REACT_APP_API_URL`, `VITE_API_URL`
4. Development fallback: `http://localhost:5001` (matches ASP.NET Core `launchSettings.json`)
5. Production fallback: `https://defi10-1.onrender.com`

All trailing slashes are stripped.

## Local Development
Run the backend (ASP.NET Core) so it listens at `http://localhost:5001`, then in `frontend/` run:

```
npm install
npm run dev
```

`.env.development` already sets `VITE_API_BASE_URL=http://localhost:5001`.

The Vite dev server (port 10002) also proxies `/api` and `/health` to `http://localhost:5001`, so components can use either:

```ts
fetch(`${config.API_BASE_URL}/api/v1/wallets/...`)
// or relative
fetch('/api/v1/wallets/...') // in dev this is proxied; in prod you should use the absolute base
```

## Static Deployment Override
If you deploy the built assets to a different environment without rebuilding, set a global before loading the bundle, for example in `index.html`:

```html
<script>window.__API_BASE__ = 'https://staging.example.com';</script>
```

## Adding New Environment Variables
Prefix with `VITE_` so Vite exposes them to the client (e.g. `VITE_FEATURE_FLAG_X=true`). Access via `import.meta.env.VITE_FEATURE_FLAG_X`.

## Troubleshooting
- Seeing requests hit production while in dev: ensure `.env.development` is present and restart `npm run dev`.
- CORS errors in dev with absolute URLs: prefer relative `/api/...` or confirm the backend has CORS enabled for `http://localhost:10002`.
- Need a one-off override: use `window.__API_BASE__`.
