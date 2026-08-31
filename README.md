# Check-in backend

Receives check-ins from the PWA and shows them in a live table.

## Run locally

```bash
npm install
node server.js
```

- Table view: http://localhost:3000
- API used by the PWA: `POST http://localhost:3000/api/checkin`
- Raw data as JSON: `GET http://localhost:3000/api/checkins`

Then set `BACKEND_URL` in the PWA's `app.js` to this server's `/api/checkin`
URL (once deployed, that must be an `https://` URL — see below).

## Data storage

Check-ins are appended to `data/checkins.json` on disk. That's fine for a
demo or small personal deployment. If you outgrow it, swap `readCheckins`/
`appendCheckin` in `server.js` for a real database (Postgres, SQLite, etc.)
— the rest of the server doesn't need to change.

## Deploying

Any host that runs a Node process works. Easiest free options:

- **Render.com** — "New Web Service", connect your repo (or upload this
  folder), build command `npm install`, start command `node server.js`.
  Free HTTPS URL out of the box.
- **Railway.app** — similar flow, auto-detects Node, free HTTPS URL.
- **Fly.io** — `fly launch` in this folder, follow the prompts.

⚠️ On most of these free tiers, the filesystem is **ephemeral** — it resets
on redeploy or restart, which means `data/checkins.json` gets wiped. That's
fine for testing. For anything you want to keep long-term, either:
- attach a persistent volume (Render and Fly both offer this), or
- swap in a real database (e.g. a free Postgres instance from Neon or
  Supabase) once you're past the prototype stage.

## CORS

The server allows requests from any origin (`cors()` with no restrictions)
so the PWA — hosted on a different domain — can POST to it. Once you know
your PWA's final domain, you can lock this down by passing options to
`cors({ origin: "https://your-pwa-domain.example.com" })` in `server.js`.
