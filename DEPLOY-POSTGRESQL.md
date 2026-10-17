# PostgreSQL conversion and deployment

This project has been converted from SQLite (`better-sqlite3`) to PostgreSQL (`pg`). The React frontend API contract is unchanged.

## Local setup
1. Install Node.js 20+ and PostgreSQL.
2. In `backend`, copy `.env.example` to `.env` and set `DATABASE_URL`, a long random `JWT_SECRET` (32+ characters), `ADMIN_USERNAME`, and a strong `ADMIN_PASSWORD`.
3. Run `npm install` in `backend`, then `npm run seed`, then `npm run dev`.
4. In the project root, copy `.env.example` to `.env`, keep `VITE_API_URL=/api`, run `npm install`, then `npm run dev`.
5. Open the Vite URL shown in the terminal and test `/api/health` on port 5000.

The backend creates the PostgreSQL tables automatically on startup. `npm run seed` creates an admin only if it does not exist and adds example rows only if those tables are empty. It does not reset existing data.

## Import existing SQLite data
The original database was retained as `backend/db/portfolio.sqlite.backup` for migration. After configuring PostgreSQL in `backend/.env`, run `npm run migrate:sqlite` from `backend`. This imports admins, projects, certificates and settings. It is designed to be rerun without duplicating rows with the same IDs. Keep a separate backup before importing. Uploaded files live in `backend/uploads`; copy that folder to persistent storage too, because the database stores their URLs, not the file bytes.

## Production hosting
- Provision a managed PostgreSQL database and use its full connection string as `DATABASE_URL` (keep it private).
- Deploy `backend` as a Node web service with `npm install` / `npm start` and set `JWT_SECRET`, `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `CORS_ORIGIN` in the provider's environment settings.
- If uploads are used, mount persistent storage and set `UPLOADS_DIR` to that mounted path. Copy existing `backend/uploads` files there.
- Deploy the frontend as a static Vite site. Set `VITE_API_URL` to `https://YOUR-BACKEND-HOST/api` before building. Rebuild after changing this value.
- Set `CORS_ORIGIN` to the exact frontend origin(s), comma-separated. Enable HTTPS.
- Set regular PostgreSQL backups and periodically test restoring one.

## Important
- Real `.env` files and `.git` history are intentionally excluded from this ZIP. Do not publish passwords or tokens.
- The included SQLite database is a migration source only; the running backend uses PostgreSQL.
- Verify the admin login, project/certificate create-update-delete, image uploads, and data after a backend restart before considering deployment complete.
