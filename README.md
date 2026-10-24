# EduManage

A responsive school-management **local demo**, built with vanilla JavaScript and Vite. The workspace includes 96 fictional students: 8 students in each of Grades 1–12, with 12 class teachers and sample attendance, invoices, and events.

## Run locally

Requires Node.js 22.12+ (Node 24 is also supported).

```sh
npm ci
npm run dev
```

Open the address printed by Vite (default port **5173**). The server binds to `0.0.0.0`; Arena's `.e2b.app` preview hosts are allowed. There are no external font, icon, or image requests.

```sh
npm run build      # production assets in dist/
npm run preview    # serve the production build
npm test           # data, validation, money, dates, escaping, and CSV tests
npm run test:e2e   # Chromium browser workflow and responsive-layout tests
npm run format:check
```

Browser tests use an npm-packaged headless Chromium for Linux x64, including runtime libraries, so a separate browser download is not needed in the Arena workspace. On another platform, configure Playwright to use its platform browser instead of `@sparticuz/chromium`.

## What works

- **Overview:** live enrollment, attendance, fee totals, last-seven-day attendance chart, upcoming events, recent students, and quick actions.
- **Students:** enroll, view profile, edit, transfer classes, set active/inactive status, delete with confirmation, search, filter, paginate, and export filtered CSV records.
- **Classes:** populated Grades 1–12; view rosters, assign teachers, change rooms and capacity, and select subjects. Enrollment respects class capacity.
- **Teachers:** add and edit teacher details, prevent duplicate teacher emails, and see class assignments.
- **Attendance:** date- and class-specific present/absent/late records, bulk mark-present, automatic saving, and CSV export. Future attendance is rejected. Unmarked is not treated as absent.
- **Fees:** create student invoices and record partial or full offline payments in NPR. Balances update immediately; zero/negative payments and overpayments are rejected.
- **Calendar:** monthly navigation and event creation, editing, and deletion.
- **Reports:** enrollment/capacity, class attendance totals, collection totals, and school-summary CSV export.
- **Settings:** school profile, JSON backup/restore, and confirmed demo reset. Backups are validated before replacement, including references and payment-ledger consistency.
- Responsive navigation, accessible native dialogs, keyboard focus handling, search shortcut, empty states, validation messages, and notifications.

## Data and safety

This is **not a production student-information system**. There is no backend, authentication, authorization, encryption, cloud sync, online payment processing, or server-side audit trail. The displayed administrator is a demo persona, not an authenticated user. Use fictional records only.

Data is stored in `localStorage` under `edumanage.v1` for the current browser and origin. Clearing browser data removes records. Different preview URLs or devices do not share data. Export a JSON backup in **Settings** regularly; CSV exports are reports, not restorable backups. Avoid simultaneous edits in multiple tabs.

If storage is full or unavailable, an alert explains that changes are session-only. Malformed existing storage is not automatically overwritten: the app uses a temporary sample workspace and offers explicit restore/reset. Restoring a backup or resetting replaces the workspace after confirmation. Deleting a student also removes their associated attendance, invoices, and payment records.

Sample dates are generated relative to the first launch. The attendance rate counts present and late students divided by marked active-student records. Student profiles summarize all their marked days. Historical class reports use current class membership; they are not immutable enrollment snapshots. Fee totals cover all recorded invoices, not a specific billing month. Money uses two-decimal precision. Events and attendance use the browser's local calendar dates.

Before real deployment, add a secure backend/database, role-based access, a server-side transaction and audit model, appropriate privacy controls, tested recovery procedures, and school-specific academic rules. Automated tests reduce regressions but cannot guarantee a bug-free system.

## Structure

- `app.js` — workspace rendering, routes, dialogs, and user workflows
- `core.js` — demo data, validation, filtering, attendance calculations, payments, and exports
- `index.html`, `styles.css` — application shell and responsive visual system
- `tests/` — unit and browser regression tests

## Live deployment

The public demo is hosted on **https://vten-team.github.io/School-magment/**.

GitHub Pages serves the static app directly from the root of the `main` branch.
Changes are developed on `arena/197cc719-school-magment` and deployed by merging
a pull request into `main`. The HTML uses relative asset paths, so it works
under the repository subdirectory as well as locally. `.nojekyll` disables
unnecessary Jekyll processing. The browser modules do not require a build step
or a backend. To update this deployment, test changes, push the working branch,
and merge its pull request into `main`.
`npm run build` also produces a portable, bundled version in `dist/` for other
static hosts.

The hosted demo still stores data only in each visitor's own browser; it does
not share records between users. Browser data from a development preview does
not automatically transfer to the deployed site. Use Settings → Download backup
and Restore backup to transfer fictional demo records if needed.
