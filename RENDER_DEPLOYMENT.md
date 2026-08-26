# BRANCH ASECA DANGACHUA — Render Deployment

## Free deployment
1. Push this project to GitHub.
2. In Render, choose **New → Blueprint** and select the repository.
3. Render will read `render.yaml`.
4. The service uses Node 20, builds with Vite, starts with `node server/index.js`, and checks `/api/health`.

## Important storage note
This project currently uses local SQLite/file storage. Render's free web-service filesystem is ephemeral.
This package is therefore ready for **demo/testing deployment**, but permanent production data should eventually be moved to a persistent database/storage service.

## Manual settings if needed
- Build Command: `npm install && npm run build`
- Start Command: `node server/index.js`
- Health Check: `/api/health`
- Node: 20.x
