# English Student System

A full-stack English learning platform with a React frontend and a NestJS backend.

This system supports student learning workflows (reading, vocabulary, quizzes, writing) and teacher/admin workflows (content creation and management).

## Overview

- Frontend: React 19 + TypeScript + Vite
- Backend: NestJS 11 + TypeScript + PostgreSQL
- Background jobs: BullMQ + Redis
- AI quiz generation: LangChain + Google Gemini
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
- `src/config/redis.client.ts` provides shared Redis cache access and cache invalidation helpers.
- `src/llm/` contains LLM integration and quiz generation pipelines.
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
- AI-assisted quiz generation workflow (queued job)
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
- llm

## Data Model Overview

The schema is organized into distinct learning domains. Instead of a single dense diagram, the system is broken into focused modules for clarity.

---

### 🧠 Quiz System

```mermaid
erDiagram
    QUIZZES ||--o{ QUIZ_QUESTIONS : includes
    QUESTIONS ||--o{ QUIZ_QUESTIONS : appears_in

    QUIZZES ||--o{ QUIZ_ATTEMPTS : has
    USERS ||--o{ QUIZ_ATTEMPTS : makes

    QUIZ_ATTEMPTS ||--o{ STUDENT_ANSWERS : produces
    QUESTIONS ||--o{ STUDENT_ANSWERS : answered_in

    QUESTIONS ||--o{ QUESTION_OPTIONS : has
    QUESTIONS ||--o{ ANSWERS : has
```

Core flow:

- quiz → quiz_questions → questions
- quiz_attempts → student_answers

---

### 📚 Topics & Categorization

```mermaid
erDiagram
    TOPICS ||--o{ QUIZZES : categorizes

    QUIZZES ||--o{ QUIZ_TOPICS : mapped_to
    TOPICS ||--o{ QUIZ_TOPICS : mapped_to
```

> ⚠️ Note: You currently have both `quizzes.topic_id` and `quiz_topics`. Consider choosing one approach (one-to-many vs many-to-many).

---

### 📝 Writing System

```mermaid
erDiagram
    WRITING_TASKS ||--o{ WRITING_SUBMISSIONS : has
    USERS ||--o{ WRITING_SUBMISSIONS : submits
```

---

### 📖 Vocabulary System

```mermaid
erDiagram
    VOCABULARY ||--o{ VOCABULARY_TOPIC_WORDS : linked_to
    VOCABULARY_TOPICS ||--o{ VOCABULARY_TOPIC_WORDS : groups
```

---

### 📦 Assignments System

```mermaid
erDiagram
    USERS ||--o{ ASSIGNMENTS : creates
    ASSIGNMENTS ||--o{ ASSIGNMENT_ITEMS : contains
```

> ℹ️ `assignment_items` uses a polymorphic pattern (`content_type`, `content_id`) and may reference multiple content types (quizzes, texts, etc.).

## Example End-to-End Flows

### How a student takes a quiz

1. Fetch available quizzes with `GET /quizzes`.
2. Load quiz content with `GET /quiz-questions/:quizId/full`.
3. Start an attempt with `POST /quiz-attempts` (includes `quizId` and `userId`).
4. Save answers during progress with `POST /student-answers` (upsert per question).
5. Submit final attempt with `POST /student-answers/submit-attempt/:attemptId`.
6. Read attempt history or latest progress with `GET /quiz-attempts?userId=...&quizId=...`.

### How a teacher creates a quiz

1. Create quiz metadata with `POST /quizzes`.
2. Create one or more question records with `POST /questions`.
3. Add valid answers with `POST /answers`.
4. Attach questions to the quiz with point weights via `POST /quiz-questions`.
5. Verify assembled payload via `GET /quiz-questions/:quizId/full`.

Teacher write operations are protected by `TeacherGuard`.

### How AI quiz generation works

1. Trigger generation with `POST /quizzes/generate` using `topic`, `multipleChoiceCount`, and `openEndedCount`.
2. The API enqueues a BullMQ job in the `generate-quiz` queue.
3. A worker (`quiz-generator.worker.ts`) runs the LLM quiz pipeline.
4. The pipeline builds a prompt, validates output shape/rules, normalizes quiz questions, and returns generated content.
5. Current behavior: the generated payload is returned by the worker and logged from worker lifecycle hooks; persistence into quiz tables is not implemented yet.

## API Surface (High-level)

Base URL in local development: `http://localhost:3000`

Primary API reference:

- Swagger/OpenAPI UI: `GET /api`

Domain route groups:

- `GET /health` - Health check
- `auth/*` - Login/register/logout/current user
- `users/*` - User operations
- `assignments/*` and `assignment-items/*`
- `quizzes/*`, `questions/*`, `question-options/*`, `quiz-questions/*`, `quiz-attempts/*`
- `student-answers/*` and `answers/*`
- `texts/*`
- `writing-tasks/*`, `writing-submissions/*`
- `vocabulary/*`, `vocabulary-topics/*`, `vocabulary-topic-words/*`
- `send-email/*`

Additional quiz endpoint:

- `POST /quizzes/generate` - Enqueue AI-based quiz generation job

### API examples

Create a quiz (teacher only):

```http
POST /quizzes
Content-Type: application/json

{
    "title": "Past Simple Review",
    "description": "Mixed grammar and vocabulary"
}
```

Example response:

```json
{
    "id": "2e2fcbf3-1f6b-4a19-a2ab-8f1ba78b8880",
    "title": "Past Simple Review",
    "description": "Mixed grammar and vocabulary",
    "createdAt": "2026-03-23T11:42:10.000Z"
}
```

Start a quiz attempt:

```http
POST /quiz-attempts
Content-Type: application/json

{
    "quizId": "2e2fcbf3-1f6b-4a19-a2ab-8f1ba78b8880",
    "userId": "f58d89c7-22d6-4d4d-9db4-d3f175e9f001"
}
```

Save or update an answer during an attempt:

```http
POST /student-answers
Content-Type: application/json

{
    "attemptId": "d3ba56ea-f82e-44ce-9f15-0b738703de67",
    "questionId": "d18a51b0-b76a-4501-af61-3a9f31d4df8f",
    "answerData": {
        "value": "went"
    }
}
```

## Authentication and Session Behavior

- Login endpoint sets `access_token` cookie.
- Cookie is HTTP-only and environment-sensitive:
    - production: `secure: true`, `sameSite: none`
    - development: `secure: false`, `sameSite: lax`
- Protected backend routes use guards that verify token + role.
- Teacher-only routes are guarded by role checks.

## Authorization Model

Current behavior in the codebase:

- `student`: default role assigned on registration (`POST /auth/register`), can access authenticated student workflows.
- `teacher`: required for protected content-management endpoints guarded by `TeacherGuard` (for example quiz/question/answer creation and updates).

At the frontend level:

- Authenticated route access is enforced by the protected route wrapper.
- Admin page UI checks for teacher role before showing management tabs.

If you introduce additional roles (for example a dedicated `admin` backend role), document explicit permissions per module here.

## Validation and Error Handling

Validation strategy:

- A global `ValidationPipe` is enabled with:
    - `whitelist: true`
    - `forbidNonWhitelisted: true`
    - `transform: true`
- DTOs use `class-validator` and `class-transformer` decorators for runtime request validation and type coercion.

Error handling strategy:

- Services and guards raise NestJS HTTP exceptions (for example `BadRequestException`, `UnauthorizedException`).
- The API currently relies on NestJS default exception responses (status code + message payload).
- Sentry captures runtime/server errors in both backend and frontend integrations.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router v7
- Axios
- TanStack Query
- Sentry React SDK

## Frontend Architecture

State and data flow:

- Server state is managed with TanStack Query (query caching, stale-time policy, retry policy).
- Session/auth state is handled by `AuthContext` using the current-user query as the source of truth.
- HTTP communication is centralized in a shared Axios client configured with `withCredentials: true`.

Routing structure:

- `react-router-dom` drives route-level page composition.
- Public route: `/login`.
- Protected routes: `/`, `/reading`, `/practice`, `/vocab`, `/quiz`, `/quiz/:quizId`, `/admin`.
- All protected routes render inside a shared app shell (`Navbar` + main content area).

Component architecture:

- `src/pages/` contains screen-level orchestration and route entry points.
- `src/components/` contains reusable feature and layout components.
- `src/services/` contains API-domain service wrappers.
- `src/hooks/` contains query/mutation hooks and shared behavior.

This separation keeps UI rendering concerns, data fetching, and API communication decoupled.

### Backend

- NestJS 11
- TypeScript
- PostgreSQL (`pg` Pool)
- Redis (Upstash Redis SDK for cache, Redis connection for BullMQ)
- BullMQ (`@nestjs/bullmq` + `bullmq`)
- LangChain + Google Gemini (`@langchain/google-genai`)
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
- Redis instance (Upstash Redis recommended for current cache setup)

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

REDIS_URL=your_upstash_rest_url
REDIS_TOKEN=your_upstash_rest_token
REDIS_FULL_URL=your_redis_connection_url_for_bullmq

GOOGLE_API_KEY=your_google_genai_api_key

EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password

FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

Notes:

- `FRONTEND_URL` is used by CORS and email templates.
- `REDIS_URL`/`REDIS_TOKEN` are used by the cache layer (`RedisService`).
- `REDIS_FULL_URL` is used by BullMQ queue workers.
- `GOOGLE_API_KEY` is used by the LLM provider for quiz generation.
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
- Redis/queue issues:
    - verify `REDIS_URL`, `REDIS_TOKEN`, and `REDIS_FULL_URL`
- LLM generation issues:
    - verify `GOOGLE_API_KEY` and outbound network access
- Login token issues:
    - verify `JWT_SECRET` is set and consistent

## License

This repository includes an MIT license file at `LICENSE`.
