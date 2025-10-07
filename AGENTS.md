# Repository Guidelines

## Project Structure & Module Organization
- `client/` holds the Vite + React app. `src/components` covers UI primitives, `src/pages` handles routing targets, while shared logic sits in `src/context`, `src/hooks`, and `src/lib`. Static assets live in `public/`; generated bundles land in `dist/` and stay untracked.
- `server/` implements the Express API. HTTP handlers live in `routes/`, Supabase helpers in `db/`, reusable middleware in `middleware/`, and realtime listeners in `db_listeners/`.

## Build, Test, and Development Commands
- Install deps once per workspace: `npm install` inside both `client/` and `server/`.
- Frontend dev server: `npm run dev` (in `client/`) starts Vite on port 5173 with hot reload.
- Frontend build: `npm run build` (in `client/`) compiles TypeScript and bundles assets.
- API development: `npm run dev` (in `server/`) runs the Express server via `ts-node` on port 3000.
- API build: `npm run build` (in `server/`) emits compiled JavaScript to `server/dist/`, then launch with `npm start`.
- Linting: `npm run lint` (in `client/`) applies ESLint rules before committing UI changes.

## Coding Style & Naming Conventions
- TypeScript is expected everywhere; keep files as `.ts`/`.tsx`.
- Match the 2-space indentation already in the repo.
- Use PascalCase for components (e.g. `ChatPage.tsx`), camelCase for functions and state, and reserve `snake_case` for Supabase column names.
- Place shared helpers in `client/src/lib/` or `server/utils/`.

## Testing Guidelines
- Frontend testing is manual today; add Vitest + Testing Library suites under `client/src/**/__tests__/` as features stabilize.
- Backend smoke check: from `server/`, run `node tests/jwks-test.js` to verify Supabase JWKS access. Document new test runners in `package.json`.
- Before opening a PR, run `npm run lint` (client) and click through login, chat, and transcript flows.

## Commit & Pull Request Guidelines
- History favors concise, imperative subjects (`Fix chat rename race`) with related work squashed together.
- PRs should link issues, summarize changes, list test evidence, and attach UI screenshots or GIFs whenever the UX shifts.
- Flag new configuration, migrations, or follow-ups so reviewers can prepare.

## Environment & Configuration
- Create `server/.env` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, and optional `LOGGING_ENABLED=true` for verbose server logs. Frontend secrets can live in `client/.env` using the `VITE_` prefix when needed.
- Keep secrets out of Git; rely on local `.env` files and deployment-level secret managers.
- When adding new environment variables, update both the backend loader (`server/db/supabase.ts` or relevant module) and contributor docs to avoid runtime surprises.
