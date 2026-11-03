# Student Learning Platform — web client

React 19 + TypeScript + Vite app. The project overview, layout, routes and environment variables are in the [repository README](../README.md).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run lint
npm run build      # type-check + production build
```

When developing locally, set `VITE_API_BASE_URL=http://localhost:5117` (the .NET API). It defaults to `/api`, which Vercel rewrites in production.
