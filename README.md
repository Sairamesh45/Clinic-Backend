# Clinic Backend

Express + Prisma backend scaffolded for PostgreSQL.

## Getting started

1. Copy `.env.example` to `.env` and fill in your credentials.
2. Run `npm install` to download dependencies.
3. Apply Prisma migrations or introspect your database:
   ```bash
   npx prisma db push
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## Project layout

- `src/index.js` loads environment variables and starts the Express server.
- `src/app.js` defines middleware and the `/health` route.
- `src/prisma/client.js` instantiates Prisma and hooks into shutdown signals.
- `prisma/schema.prisma` describes your Postgres schema and is used to generate the Prisma client.

## Feature-based structure

- `src/modules` keeps domain-specific controllers, services, and routes grouped per feature (auth, clinic, doctor, patient, appointment).
- `src/config` centralizes environment loading and configuration values.
- `src/middleware` holds shared Express middleware such as logging and error handling.
- `src/utils` contains response helpers used across controllers.

## Prisma Schema Notes

- The `Clinic` model owns many `Doctor` records, and each `Doctor` must belong to one `Clinic`.
- `Patient` rows are unique by email, and appointments point to both a `Doctor` and a `Patient`.
- `Appointment` carries the requested `tokenNumber`, `date`, `status`, and timestamps while enforcing `doctorId+date+tokenNumber` uniqueness and adding indexes on `(doctorId, date)` plus `status` for fast lookups.
