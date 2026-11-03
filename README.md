# Student Learning Platform — web client

The web app for a tutoring platform where one teacher runs several subjects: English, Mathematics, Computer Science, and any subject added later. Teachers enrol students, publish lessons and quizzes, give assignments and grade handwritten exams. Students see what is due, study lessons, take quizzes and read their feedback. The app is fully bilingual (English and Hebrew, with right-to-left layout).

The platform started as an English-only practice tool, hence the repository name.

| Folder      | What it is                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `frontend/` | The React app. This is what is developed and deployed.                                              |
| `backend/`  | **Legacy** NestJS API. Replaced by the .NET backend in the `english-student-system-dotnet` repository; kept for reference only. |

## What it does

**Students**

- **Dashboard and assignments**: what is due today, progress per content type, and every assignment with its items.
- **Subject switcher**: students only see the subjects they are enrolled in, at their level. English adds a Learn menu (lessons, readings, vocabulary) and a Practice menu (quizzes, exercises).
- **Lessons**: Markdown notes plus uploaded materials. PDFs show as a slide deck or as pages, depending on their shape; HTML labs run in a sandboxed frame.
- **Quizzes**: multiple-choice, fill-in-the-blank and handwritten questions, with LaTeX, images, audio and optional time limits. For handwritten questions, students photograph or scan their work and upload it.
- **Results and feedback**: scores, teacher comments and annotated scans, shown once the teacher has finished grading.
- **English practice**: readings with audio, vocabulary flashcards, writing.
- **Push notifications** for new assignments (installable as a PWA).

**Teachers** (admin panel, `/admin`)

| Tab                | Purpose                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| Pending Approvals  | Approve students who registered                                            |
| Students           | Enrol students in subjects and levels, give assignments, follow progress   |
| Grading            | Score handwritten answers, write feedback, upload annotated scans          |
| Subjects & Topics  | Manage subjects, levels and each subject's topic tree                      |
| Lessons            | Create lessons and upload their PDFs and HTML pages                        |
| Quizzes            | Build quizzes from the question bank, link lessons, generate questions with AI |
| Readings           | Manage readings and their audio (English)                                  |
| Vocabulary         | Manage vocabulary topics and words, including bulk import (English)        |

## Stack

| Package                                         | Purpose                                         |
| ----------------------------------------------- | ----------------------------------------------- |
| React 19 + TypeScript + Vite 8                  | UI and build                                    |
| React Router 7                                  | Routing                                         |
| TanStack Query 5                                | Server state and caching                        |
| Axios                                           | HTTP client (`withCredentials` for the auth cookie) |
| i18next / react-i18next                         | English and Hebrew; Hebrew switches the page to RTL |
| react-markdown, remark-gfm, remark-math, rehype-katex, rehype-sanitize | Markdown with LaTeX math, sanitized |
| pdfjs-dist                                      | Lesson PDFs as slides or pages (loaded on demand) |
| Sentry                                          | Error monitoring                                |
| Vitest                                          | Unit tests                                      |

## Project layout (`frontend/src`)

```
pages/          # route-level screens: Dashboard, Assignments, Lessons, Quiz, QuizList, StudyGuide,
                # Reading, Vocab, Practice, Admin, Login, Register
components/
  admin/        # teacher panel: students, grading, subjects, lessons/, quizzes/, readings/, vocabulary/
  lessons/      # lesson material viewer; pdf/ holds the pdf.js slide/page viewer
  quiz/         # quiz flow: setup, questions, countdown, results, attempt history
  exam/         # handwritten answers: uploader, gallery, exam view
  content/      # RichText (Markdown + LaTeX), question images, lightbox
  dashboard/  reading/  vocab/  practice/  layout/  auth/  register/
contexts/       # AuthContext, SubjectProvider (current subject and level)
hooks/          # queries.ts and mutations.ts (TanStack Query)
services/       # one API wrapper per backend resource, plus the shared Axios client
types/          # shared types by domain
i18n/locales/   # en.ts and he.ts (he.ts is type-checked against en.ts)
config/         # API base URL, lesson viewer switch, Sentry
utils/          # helpers (uploads, topics, exams, push notifications, ...)
public/sw.js    # service worker for push notifications
```

## Routes

| Path                            | Who      | Screen                         |
| ------------------------------- | -------- | ------------------------------ |
| `/login`, `/register`           | Public   | Sign in, register              |
| `/`                             | Student  | Dashboard                      |
| `/assignments`                  | Student  | All assignments                |
| `/lessons`, `/lessons/:lessonId`| Student  | Lesson list and lesson         |
| `/quiz`, `/quiz/:quizId`        | Student  | Quiz list and quiz             |
| `/quiz/:quizId/guide/:guideId`  | Student  | A lesson opened from a quiz    |
| `/reading`, `/reading/:textId`  | Student  | Readings (English)             |
| `/vocab`                        | Student  | Vocabulary (English)           |
| `/practice`                     | Student  | Exercises (English)            |
| `/admin`                        | Teacher  | Admin panel                    |

Teachers are sent to `/admin`; students are kept out of it.

## Running locally

Requires Node.js 20+ and the .NET backend running (see the `english-student-system-dotnet` README).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

| Script            | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Vite dev server                    |
| `npm run build`   | Type-check and production build    |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | ESLint                             |
| `npm test`        | Vitest                             |

### Environment variables

| Variable            | Default | Purpose                                                                       |
| ------------------- | ------- | ----------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`  | Backend URL. In development, set it to the local .NET API, `http://localhost:5117`. (The Vite dev proxy for `/api` still points at the legacy NestJS port 3000.) |
| `VITE_PDF_VIEWER`   | pdf.js  | Set to `native` to show lesson PDFs in the browser's own PDF viewer instead.  |

## Deployment

The app is deployed on Vercel (`frontend/vercel.json`):

- `/api/*` is rewritten to the .NET API on Google Cloud Run, so the auth cookie stays same-site.
- Every other path is rewritten to `index.html` for client-side routing.
- Built assets get long-lived cache headers.

Deploy the backend first when a change needs new API endpoints.

## License

MIT. See [LICENSE](LICENSE).
