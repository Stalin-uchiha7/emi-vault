# EMI Vault — Family EMI Management Dashboard

A premium, production-quality dashboard for tracking your family's loans and EMIs — built with React, Material UI, Firebase, and Framer Motion. Fully free-tier: Firebase Spark plan + Vercel Hobby plan.

---

## What's inside

- **Auth & roles** — Email/password login, self-service registration, Admin/Member roles (first person to register becomes Admin automatically).
- **Dashboard** — 8 KPI cards, 6 charts (category donut, monthly EMI bar, payoff timeline, cash outflow trend, active/closed split, principal progress).
- **EMI management** — Full CRUD, search + status/category filters, mark-paid, close loan, confirmation dialogs, toast notifications.
- **Loan details** — Amortization-based principal-vs-interest and balance charts, timeline, payment history, document links, notes.
- **Calendar** — Month grid highlighting upcoming/overdue due dates.
- **Reports** — Monthly/yearly spending, interest paid/remaining, CSV + PDF export.
- **Settings** — Profile, dark mode, currency, backup & restore (JSON export/import).
- **Family Members page** (admin only) — Promote/demote roles.
- Glassmorphic cards, animated counters, progress rings, loading skeletons, empty states, smooth page transitions — all on a clean CRED/Stripe-inspired theme with full dark mode.

---

## Tech Stack

React 18 - Vite - Material UI 5 - Firebase (Auth + Firestore) - React Router 6 - Framer Motion - Recharts - Lucide + MUI Icons - Day.js - notistack (toasts) - jsPDF - PapaParse

---

## 1. Local Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your Firebase project's config (see step 2 below), then:

```bash
npm run dev
```

---

## 2. Create your Firebase project (free — Spark plan)

1. Go to https://console.firebase.google.com -> **Add project** -> name it (e.g. `family-emi-vault`) -> disable Google Analytics (not needed) -> Create.
2. **Authentication**: left sidebar -> Build -> Authentication -> Get Started -> enable **Email/Password** sign-in method.
3. **Firestore**: left sidebar -> Build -> Firestore Database -> Create database -> **Start in production mode** -> choose a region close to you.
4. **Get your web app config**: Project Settings (gear icon) -> General -> scroll to "Your apps" -> click the `</>` (Web) icon -> register app (any nickname, no hosting needed) -> copy the `firebaseConfig` values into your `.env` file.
5. **Deploy Firestore security rules** (important — this enforces Admin/Member permissions server-side):
   - Easiest: Firestore Database -> Rules tab -> paste the contents of `firestore.rules` from this project -> Publish.
   - Or via CLI: `npm install -g firebase-tools && firebase login && firebase deploy --only firestore:rules` (after `firebase use --add` to link this project).

That's it — Firebase Auth + Firestore on the Spark plan supports 50K reads/20K writes per day and unlimited users, more than enough for a family.

---

## 3. First login

Run the app, go to `/register`, and create your account — **you'll automatically become Admin** since you're the first user. Every family member after that registers the same way and defaults to Member; promote them to Admin anytime from **Settings -> Family Members**.

---

## 4. Deploy to Vercel (free — Hobby plan)

**Option A — via GitHub (recommended):**
1. Push this project to a new GitHub repo.
2. Go to https://vercel.com -> New Project -> import the repo.
3. Vercel auto-detects Vite. In **Environment Variables**, add all 6 `VITE_FIREBASE_*` keys from your `.env`.
4. Deploy. You'll get a live `https://your-app.vercel.app` URL.

**Option B — via CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```
When prompted, add the same environment variables (or set them in the Vercel dashboard afterward and redeploy).

The included `vercel.json` handles client-side routing so refreshing `/emis/some-id` works correctly.

---

## 5. Authorize your domain in Firebase

Once deployed, go back to Firebase Console -> Authentication -> Settings -> **Authorized domains** -> add your `your-app.vercel.app` domain (localhost is already authorized by default).

---

## Project Structure

```
src/
  firebase/        Firebase config + auth/firestore service layers
  context/          AuthContext, ThemeModeContext (dark mode + currency)
  theme/            MUI theme (light/dark, premium fintech styling)
  hooks/            useLoans (live data + derived metrics), useNotifications
  utils/            EMI math engine, CSV/PDF export, backup/restore
  components/
    common/         SummaryCard, AnimatedCounter, ProgressRing, EmptyState,
                     ConfirmDialog, LoadingSkeletons, PageTransition
    layout/         Sidebar, Topbar, Layout (responsive shell)
    emi/            EMITable, EMIFormDialog, EMIFilters, PaymentHistory,
                     DocumentsNotes
    charts/         6 dashboard charts + 2 loan-detail charts
  pages/            Login, Register, Dashboard, EMIsPage, LoanDetails,
                     CalendarPage, ReportsPage, SettingsPage, UsersPage
  routes/           ProtectedRoute (auth + admin gating)
firestore.rules      Server-side role enforcement (deploy this!)
```

## Notes on design decisions

- **Documents** are stored as name+URL links in Firestore rather than binary file uploads, so the whole app stays on Firebase's free Spark plan (Firebase Storage uploads would need billing enabled for meaningful usage). Family members can link Google Drive / Dropbox URLs instead.
- **EMI calculations** (outstanding balance, interest remaining, progress %, next due date) are derived live from a standard reducing-balance amortization schedule — nothing is hardcoded, so editing a loan recalculates everything instantly.
- **Real-time sync**: all data uses Firestore's `onSnapshot`, so if one family member logs a payment, everyone else's dashboard updates live.
