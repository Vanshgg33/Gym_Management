# GymDesk — Build Progress

**Last updated:** 2026-09-24  
**Status:** Active development — Phase 0+1 complete, Phase 2+ in progress

---

## Phase 0: Scaffold ✅ COMPLETE
- [x] pnpm monorepo with workspace (`apps/web`, `apps/api`, `packages/shared`)
- [x] NestJS API scaffolded + builds cleanly
- [x] Next.js 14 frontend scaffolded + builds cleanly
- [x] MongoDB via mongodb-memory-server (replica set, no Docker needed)
- [x] Shared enums, money utilities (`packages/shared/src/`)
- [x] Environment configuration (`.env` for API, `.env.local` for web)

## Phase 1: Auth + Shell ✅ COMPLETE

### Backend
- [x] OTP auth (send-otp, verify-otp, logout, /me)
- [x] JWT in HTTP-only cookies
- [x] Pretend mode: OTP printed to console with `[PRETEND OTP]`
- [x] JwtAuthGuard + RolesGuard on all protected routes
- [x] All 16 NestJS modules wired (auth, users, settings, audit, members, packages, memberships, payments, attendance, followups, finance, expenses, staff, classes, inventory, workout-plans, diet-plans, exercises, communications, support, jobs)
- [x] Seeder module: 99 exercises + 5 workout templates + 4 diet templates + default settings
- [x] Audit service (append-only)

### Frontend
- [x] Root layout with ThemeProvider + AuthProvider + QueryProvider
- [x] Login page (two-step OTP flow: phone → 6-digit code)
- [x] Dashboard shell (Sidebar with 13 items, Topbar, DashboardShell, DuesDrawer)
- [x] Next.js middleware protecting all dashboard routes
- [x] shadcn/ui CSS variable design tokens (orange primary)
- [x] Utility: `cn()`, `formatRupees()`, `formatDate()`, `timeAgo()`
- [x] Page stubs: dashboard, members, packages, attendance

## Phase 2: Packages + Members 🔄 IN PROGRESS

### Backend ✅
- [x] GymPackage schema (membership, PT, sunnyHour types)
- [x] Discount schema with date validation
- [x] Member schema with all fields (code, biometric, consent, etc.)
- [x] Members service: create (with duplicate phone check, ID prefix check, audit log)
- [x] Members service: findAll (search/filter), update, archive, restore

### Frontend 🔄 (stubs only)
- [ ] Full members directory with all filters and table
- [ ] Add member 3-step wizard (Details → Package → Confirm)
- [ ] Split payment UI
- [ ] Member profile page with all tabs
- [ ] Packages page with create/edit

## Phase 3: Membership Lifecycle 🔄 PARTIAL

### Backend ✅
- [x] Membership schema with freeze array, session tracking, status enum
- [x] Memberships service: create (auto-status based on start date)
- [x] Memberships service: freeze (push end date, once/6mo check)
- [x] Memberships service: unfreeze (pull back remaining days)
- [x] Memberships service: complete, transfer, expireOverdue, activateUpcoming
- [x] Payment schema + Invoice schema (paise-based)
- [x] Payments service: create, delete, generateInvoiceNumber

### Frontend
- [ ] Membership actions UI (freeze/unfreeze/upgrade/transfer dialogs)
- [ ] Payment split UI
- [ ] Invoice PDF generation

## Phase 4–18: Not Yet Started

- Attendance page with check-in/out
- Follow-ups page
- Finance + charts
- Staff + payroll
- Classes + PT
- Workout/diet plan assignment UI
- Support tickets UI
- Settings all 8 tabs
- Member portal (PWA)
- Trainer portal
- Biometric devices
- Online payments (Razorpay)

---

## Known Issues
- mongodb-memory-server data is ephemeral (lost on restart) — fine for dev, needs persistent MongoDB for prod
- SeederModule requires NODE_ENV=development (set explicitly in prod)
- Invoice PDF generation not yet implemented
- No rate limit on non-auth endpoints yet
