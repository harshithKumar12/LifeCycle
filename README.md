# LifeDesk — Personal Daily Command Center

One calm place to run your day: tasks, habits, quick notes, a focus timer, and the
statistics that tie them together. Everything lives locally in your browser — no
account, no server, no network.

![LifeDesk](https://img.shields.io/badge/stack-React%20%2B%20TypeScript%20%2B%20Vite-6366f1)

---

## What's inside

- **Dashboard** — today's date, a daily-completion ring, today's tasks and habits,
  upcoming deadlines, and recent notes at a glance.
- **Tasks** — create/edit/delete, low/medium/high priority, due dates, filter by
  status and priority, automatic overdue highlighting.
- **Habits** — recurring habits with per-day check-offs, current & best streaks, and
  week/month heatmaps.
- **Notes** — quick notes with tags, pinning, and instant search.
- **Focus** — a drift-free Pomodoro timer with custom durations; completed work
  sessions are logged.
- **Statistics** — 7/14/30-day trends for tasks, habits, and focus minutes, plus
  per-habit consistency.
- **Global search** — one search across tasks, habits, and notes (`Ctrl`/`Cmd` + `K`).
- **Light & dark themes**, responsive down to mobile, and full keyboard access.

All data is persisted to `localStorage`, so it survives a refresh or restart.

---

## Requirements

- **Node.js 18+** and npm.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

On first launch the dashboard shows a welcome panel — click **Load sample data** to
explore a fully-populated desk, or just start adding your own items.

### Production build

```bash
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build locally
```

## Test it

```bash
npm test           # run the unit + integration suite once
npm run test:watch # watch mode
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

The suite (50 tests) covers the pure logic (streaks, completion math, due-date
labels, search), the Zustand store's mutations and validation, and a full-app
integration test that renders the real UI, loads data, navigates routes, and
toggles a habit.

### Try the main flows manually

1. **Tasks** — add a task with a past due date; confirm it renders as *overdue*.
   Complete it; confirm it drops out of the active filter and into the completion
   stats.
2. **Habits** — create a habit, mark it done today, and watch the streak start;
   switch the card between week and month views.
3. **Notes** — add a tagged note, pin it (it sorts to the top), then search for a
   word in its body.
4. **Focus** — set a 1-minute focus duration, start the timer, let it finish; a
   session is logged and appears in *Today* and in the statistics.
5. **Search** — press `Ctrl`/`Cmd` + `K` and search across everything.
6. **Persistence** — refresh the page; your data is still there.

---

## Architecture

A single-page app with a clear separation between **pure logic**, **state**, and
**presentation**.

```
src/
  types/         Domain model (Task, Habit, Note, FocusSession, …)
  lib/           Pure, framework-free helpers (unit-tested)
    date.ts        day-keys, due-date labels, ranges
    stats.ts       streaks, completion rate, daily aggregation
    search.ts      cross-entity search
    constants.ts   validated color palette, icons, priority metadata
  store/
    useStore.ts    Zustand store + persist (localStorage) — the single source of truth
    useHydrated.ts loading gate until persisted state is read back
  components/
    ui/            Reusable primitives (Button, Modal, Toast, ProgressRing, …)
    layout/        App shell (Sidebar, Topbar, AppLayout)
    GlobalSearch, ErrorBoundary
  features/        One folder per domain (dashboard, tasks, habits, notes, focus, stats)
  App.tsx          Routing + theme + lazy-loaded pages
  main.tsx         Providers (ErrorBoundary → Router → Toast)
```

**Key decisions**

- **State: Zustand + `persist`.** All entities are plain serializable objects, so
  persistence to `localStorage` (key `lifedesk-v1`, versioned) needs no custom
  (de)serialization. The store is the only place that mutates data; components read
  via selectors. Inputs are validated and trimmed in the store as a second line of
  defence behind the forms.
- **Logic is pure and isolated in `lib/`.** Streak counting, completion math, and
  search are framework-free functions — trivially testable and reused by every
  feature. This is where most of the unit tests point.
- **Dates use local day-keys (`yyyy-MM-dd`).** A habit "done today" and a task "due
  today" are compared by local calendar day, avoiding timezone drift.
- **Drift-free Pomodoro.** The timer tracks an absolute end timestamp rather than
  decrementing a counter, so it stays accurate even if the tab is backgrounded and
  `setInterval` is throttled.
- **Route-level code splitting.** Each page is a lazy chunk, so the charting library
  (recharts) only loads when you open Statistics. Initial JS is ~73 kB gzip.
- **States are handled explicitly:** a hydration *loading* gate, *empty* states with
  a path forward, an *error* boundary, and *success* toasts.
- **Accessible, validated color.** The categorical habit/chart palette was checked
  for colorblind separation; color is never the only signal (icons + labels always
  accompany it).

## Data & privacy

Everything is stored in your browser's `localStorage`. There is no backend and no
telemetry. Clearing site data (or using the in-app reset) wipes everything.

## Known limitations

- **Single device / browser.** Data lives in `localStorage`, so it doesn't sync
  across devices or browsers, and a browser in private mode won't retain it.
- **No recurring-task scheduling.** Habits recur daily; tasks are one-off (with a
  due date). There's no "every Monday" task rule yet.
- **Focus timer runs while the tab is open.** Closing the tab ends the running
  timer; only *completed* sessions are logged.
- **No import/export** of your data yet.

## Tech stack

React 18 · TypeScript (strict) · Vite 5 · Zustand · React Router 6 · Tailwind CSS 3 ·
Recharts · date-fns · lucide-react · Vitest + Testing Library.
