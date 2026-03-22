# English Student System

A full-stack English learning platform with a React frontend and a NestJS backend.

This system supports student learning workflows (reading, vocabulary, quizzes, writing) and teacher/admin workflows (content creation and management).

## Overview

- Frontend: React 19 + TypeScript + Vite
- Backend: NestJS 11 + TypeScript + PostgreSQL
- Auth: JWT stored in HTTP-only cookies
- Data fetching: TanStack Query
- Error monitoring: Sentry (frontend + backend)
- Email: Nodemailer (Gmail service)

## Repository Structure

```text
english-student-system/
├─ backend/    # NestJS API
├─ frontend/   # React web app
└─ LICENSE
```

## Directory Deep Dive

### Backend (`backend/`)

- `src/` contains all NestJS domain modules.
- `src/config/` contains Postgres, Sentry, and Nodemailer setup.
- `src/*/*.queries.ts` exports SQL query constants for each module.
- `src/*/sql/*.sql` stores raw SQL files loaded through `PostgresService.readSql(...)`.
- `test/` contains e2e test setup.
- `certs/` contains optional DB SSL certificate assets.

### Frontend (`frontend/`)

- `src/pages/` contains route-level screens (`Admin`, `Dashboard`, `Login`, `Practice`, `Quiz`, `QuizList`, `Reading`, `Vocab`).
- `src/components/` contains feature UI components.
- `src/services/` contains API services and the Axios HTTP client.
- `src/contexts/` contains auth/session context providers.
- `src/hooks/`, `src/utils/`, and `src/types/` hold shared app logic.
- `public/` contains static assets served by Vite.

## Core Product Features

### Student-facing

- Login/authenticated app shell
- Dashboard with progress/activity panels
- Reading library
- Practice center
- Vocabulary learning views
- Quiz list + quiz taking flow

### Teacher/Admin-facing

- Admin page with content management sections
- Quiz and question management
- Quiz builder workflows
- Text management

## Backend Domain Modules

The backend is modularized by learning domain and content type:

- auth
- users
- assignments
- assignment-items
- quizzes
- questions
- question-options
- quiz-questions
- quiz-attempts
- student-answers
- answers
- texts
- writing-tasks
- writing-submissions
- vocabulary
- vocabulary-topics
- vocabulary-topic-words
- send-email

## API Surface (High-level)

Base URL in local development: `http://localhost:3000`

- `GET /health` - Health check
- `GET /api` - Swagger/OpenAPI docs
- `auth/*` - Login/register/logout/current user
- `users/*` - User operations
- `assignments/*` and `assignment-items/*`
- `quizzes/*`, `questions/*`, `question-options/*`, `quiz-questions/*`, `quiz-attempts/*`
- `student-answers/*` and `answers/*`
- `texts/*`
- `writing-tasks/*`, `writing-submissions/*`
- `vocabulary/*`, `vocabulary-topics/*`, `vocabulary-topic-words/*`
- `send-email/*`

## Authentication and Session Behavior

- Login endpoint sets `access_token` cookie.
- Cookie is HTTP-only and environment-sensitive:
    - production: `secure: true`, `sameSite: none`
    - development: `secure: false`, `sameSite: lax`
- Protected backend routes use guards that verify token + role.
- Teacher-only routes are guarded by role checks.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router v7
- Axios
- TanStack Query
- Sentry React SDK

### Backend

- NestJS 11
- TypeScript
- PostgreSQL (`pg` Pool)
- class-validator / class-transformer
- Argon2 (password hashing)
- jsonwebtoken
- cookie-parser
- Nodemailer
- Sentry Node SDK

## Backend Query Architecture

- Query text is externalized into `.sql` files per module (for example: `backend/src/quizzes/sql/*.sql`).
- Query constants are exported from each `*.queries.ts` file via `PostgresService.readSql(__dirname, fileName)`.
- SQL files are copied into build output via Nest CLI assets configuration (`backend/nest-cli.json`).
- This keeps service classes focused on orchestration and DTO mapping, while SQL stays versionable and readable.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database (or managed Postgres such as Supabase)

## Environment Configuration

Create `backend/.env` with your own values.

### Required backend variables

```env
POSTGRES_USER=your_db_user
POSTGRES_HOST=your_db_host
POSTGRES_DATABASE=your_db_name
POSTGRES_PASSWORD=your_db_password
POSTGRES_PORT=5432

JWT_SECRET=your_long_random_secret

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

Notes:

- `FRONTEND_URL` is used by CORS and email templates.
- SSL cert support is implemented in `backend/certs/prod-ca-2021.crt` if present.
- Current frontend HTTP client logic uses:
    - development: `http://localhost:3000`
    - production: `/api` (rewritten by Vercel)

## Local Development

Install dependencies in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Run backend:

```bash
cd backend
npm run start:dev
```

Run frontend (new terminal):

```bash
cd frontend
npm run dev
```

Open app at: `http://localhost:5173`

## Available Scripts

### Backend scripts

- `npm run start:dev` - Start API in watch mode
- `npm run build` - Build NestJS app
- `npm run start:prod` - Run compiled output
- `npm run lint` - Lint backend source
- `npm run test` - Unit tests
- `npm run test:e2e` - End-to-end tests

### Frontend scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check + production build
- `npm run preview` - Preview production build
- `npm run lint` - Lint frontend source

## Deployment Notes

Frontend deployment is configured for Vercel:

- Requests to `/api/*` are rewritten to the deployed backend.
- All other routes are rewritten to `index.html` (SPA routing).
- Static asset caching headers are configured for long-lived immutable files.

Backend is designed to run as a standalone NestJS API (`node dist/main`).

## Testing

Backend tests:

```bash
cd backend
npm run test
npm run test:e2e
```

Frontend currently has lint/build validation via npm scripts.

## Security Recommendations

- Never commit real secrets in `.env` files.
- Rotate any credentials that were previously committed or shared.
- Use distinct credentials per environment (development/staging/production).
- Consider adding:
    - `backend/.env.example` with placeholder values
    - secret scanning in CI

## Troubleshooting

- CORS/auth cookie issues:
    - ensure `FRONTEND_URL` matches your active frontend origin
    - ensure frontend requests use `withCredentials: true`
- Database connection issues:
    - verify Postgres host/port/SSL cert and credentials
- Login token issues:
    - verify `JWT_SECRET` is set and consistent

## License

This repository includes an MIT license file at `LICENSE`.
