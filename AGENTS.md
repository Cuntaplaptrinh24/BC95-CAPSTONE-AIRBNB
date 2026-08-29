<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Rules

- **Airbnb User only** — absolutely no Admin features or endpoints.
- **Base URL already contains `/api`** — never append `/api` again.
- **Never modify or display `.env` values** in code, logs, or errors.
- **Prefer Server Components.** Use `"use client"` only when the component requires interactivity (events, hooks, browser APIs).
- **TypeScript strict** — no `any`, no `console.log`, no dead code.
- **Responsive** across iPhone, iPad, and desktop.
