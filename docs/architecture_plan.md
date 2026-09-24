# GymDesk — Architecture Plan
**Date:** 2026-09-20  
**Stack:** Next.js 14 (App Router) · NestJS (MVC) · MongoDB (Mongoose)  
**Scope:** Single-gym management platform — one gym, no multi-tenancy

---

## 1. Project Overview

GymDesk is a full-featured gym management platform for a single gym. It manages memberships, payments, attendance, staff, classes, fitness plans, inventory, and communications across five role-based portals.

**Portals:**
| Portal | Users | Access |
|--------|-------|--------|
| Owner | Gym owner | All pages, all actions |
| Manager | Gym manager | Configurable subset of owner pages |
| Front Desk | Reception staff | Check-in, sign-ups, dues collection |
| Trainer | Trainers | My clients, sessions, plans |
| Member | Gym members | PWA — check-in, membership, plans |
| Public | Anyone | Join page, enquiry form |

---

## 2. Architecture Overview (MVC)

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND  — Next.js 14 App Router (TypeScript)     │
│  Tailwind CSS · shadcn/ui · Recharts                │
│  Role-gated route groups: (owner) (manager)         │
│  (frontdesk) (trainer) (member) (public)            │
└──────────────────┬──────────────────────────────────┘
                   │  HTTP (REST) — JWT in HTTP-only cookie
┌──────────────────▼──────────────────────────────────┐
│  BACKEND  — NestJS MVC (TypeScript)                 │
│  Controller → Service → Repository → Mongoose Model │
│  Modular: one NestJS module per domain              │
│  Global: AuthGuard · RolesGuard · TenantGuard       │
│  Pipes: ValidationPipe (class-validator)            │
│  Middleware: Helmet · CORS · RateLimit · Logger     │
└──────────────────┬──────────────────────────────────┘
                   │  Mongoose ODM
┌──────────────────▼──────────────────────────────────┐
│  DATABASE  — MongoDB (Replica Set for transactions) │
│  Collections per domain · Indexes on hot queries    │
└─────────────────────────────────────────────────────┘
```

**MVC layer responsibilities:**
- **Controller** — parse request, validate DTO, call service, return HTTP response. No business logic.
- **Service** — all business logic, orchestration, transactions. No Mongoose queries directly.
- **Repository** — all Mongoose queries wrapped in methods. Services never call `.find()` directly.
- **DTO** — shape of data at the HTTP boundary (request & response). Validated by `class-validator`.
- **Schema/Model** — Mongoose document shape. Never leaks out of the repository layer.

---

## 3. Monorepo Structure

```
gymdesk/
├── apps/
│   ├── web/                          # Next.js 14
│   └── api/                          # NestJS
├── packages/
│   └── shared/                       # Shared DTOs, enums, validators
├── docs/
│   ├── architecture_plan.md
│   └── decisions.md
├── package.json                      # pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json
└── .env.example
```

---

## 4. Backend Folder Structure (`apps/api/src/`)

```
src/
├── main.ts                           # Bootstrap: Helmet, CORS, pipes, cookie-parser
├── app.module.ts                     # Root module
│
├── modules/
│   ├── auth/                         # OTP login, JWT, session
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── send-otp.dto.ts
│   │   │   └── verify-otp.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── users/                        # Staff + owner accounts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── users.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── user.schema.ts
│   │
│   ├── members/                      # Members + visitors
│   │   ├── members.controller.ts
│   │   ├── members.service.ts
│   │   ├── members.repository.ts
│   │   ├── members.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── member.schema.ts
│   │
│   ├── packages/                     # Package templates + discounts
│   │   ├── packages.controller.ts
│   │   ├── packages.service.ts
│   │   ├── packages.repository.ts
│   │   ├── packages.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── package.schema.ts
│   │
│   ├── memberships/                  # Sold memberships (package instances)
│   │   ├── memberships.controller.ts
│   │   ├── memberships.service.ts
│   │   ├── memberships.repository.ts
│   │   ├── memberships.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── membership.schema.ts
│   │
│   ├── payments/                     # Payments + invoices
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── payments.repository.ts
│   │   ├── payments.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       ├── payment.schema.ts
│   │       └── invoice.schema.ts
│   │
│   ├── attendance/                   # Check-in/out records
│   │   ├── attendance.controller.ts
│   │   ├── attendance.service.ts
│   │   ├── attendance.repository.ts
│   │   ├── attendance.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── attendance.schema.ts
│   │
│   ├── staff/                        # Staff profiles, payroll, duty times
│   │   ├── staff.controller.ts
│   │   ├── staff.service.ts
│   │   ├── staff.repository.ts
│   │   ├── staff.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       ├── staff.schema.ts
│   │       └── payroll.schema.ts
│   │
│   ├── classes/                      # Group classes + schedules
│   │   ├── classes.controller.ts
│   │   ├── classes.service.ts
│   │   ├── classes.repository.ts
│   │   ├── classes.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── class.schema.ts
│   │
│   ├── followups/                    # Follow-ups + activity log
│   │   ├── followups.controller.ts
│   │   ├── followups.service.ts
│   │   ├── followups.repository.ts
│   │   ├── followups.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── followup.schema.ts
│   │
│   ├── finance/                      # Revenue data, analytics
│   │   ├── finance.controller.ts
│   │   ├── finance.service.ts
│   │   ├── finance.module.ts
│   │   └── dto/
│   │
│   ├── expenses/                     # Expenses + petty cash
│   │   ├── expenses.controller.ts
│   │   ├── expenses.service.ts
│   │   ├── expenses.repository.ts
│   │   ├── expenses.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       ├── expense.schema.ts
│   │       └── petty-cash.schema.ts
│   │
│   ├── inventory/                    # Products + suppliers
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   ├── inventory.repository.ts
│   │   ├── inventory.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       ├── product.schema.ts
│   │       └── supplier.schema.ts
│   │
│   ├── fitness/
│   │   ├── workout-plans/            # Templates + member copies
│   │   │   ├── workout-plans.controller.ts
│   │   │   ├── workout-plans.service.ts
│   │   │   ├── workout-plans.repository.ts
│   │   │   ├── workout-plans.module.ts
│   │   │   ├── dto/
│   │   │   └── schemas/
│   │   │       └── workout-plan.schema.ts
│   │   └── diet-plans/
│   │       ├── diet-plans.controller.ts
│   │       ├── diet-plans.service.ts
│   │       ├── diet-plans.repository.ts
│   │       ├── diet-plans.module.ts
│   │       ├── dto/
│   │       └── schemas/
│   │           └── diet-plan.schema.ts
│   │
│   ├── exercises/                    # 99-exercise library
│   │   ├── exercises.controller.ts
│   │   ├── exercises.service.ts
│   │   ├── exercises.repository.ts
│   │   ├── exercises.module.ts
│   │   └── schemas/
│   │       └── exercise.schema.ts
│   │
│   ├── communications/               # SMS, WhatsApp, email (pretend + real)
│   │   ├── communications.controller.ts
│   │   ├── communications.service.ts
│   │   ├── communications.module.ts
│   │   ├── providers/
│   │   │   ├── sms.provider.ts       # Interface + pretend + MSG91
│   │   │   ├── whatsapp.provider.ts  # Interface + pretend + Meta
│   │   │   └── email.provider.ts     # Interface + pretend + SMTP
│   │   └── schemas/
│   │       └── message-log.schema.ts
│   │
│   ├── support/                      # Tickets, feedback, plan requests
│   │   ├── support.controller.ts
│   │   ├── support.service.ts
│   │   ├── support.repository.ts
│   │   ├── support.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── ticket.schema.ts
│   │
│   ├── settings/                     # Gym settings, permissions, templates
│   │   ├── settings.controller.ts
│   │   ├── settings.service.ts
│   │   ├── settings.repository.ts
│   │   ├── settings.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   │       └── settings.schema.ts
│   │
│   ├── audit/                        # Audit trail — append-only
│   │   ├── audit.service.ts
│   │   ├── audit.module.ts
│   │   └── schemas/
│   │       └── audit-log.schema.ts
│   │
│   └── jobs/                         # Scheduled background jobs
│       ├── jobs.module.ts
│       ├── expire-packages.job.ts    # Midnight: close expired memberships
│       ├── auto-checkout.job.ts      # Every 5 min: close open visits
│       ├── birthday-greetings.job.ts # 08:30 daily
│       ├── renewal-reminders.job.ts  # 09:30 daily
│       ├── daily-pulse.job.ts        # 22:00 daily
│       └── recompute-totals.job.ts   # 03:00 daily
│
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── middleware/
│   │   └── logger.middleware.ts
│   ├── pipes/
│   │   └── object-id-validation.pipe.ts
│   └── enums/
│       ├── role.enum.ts
│       ├── payment-method.enum.ts
│       └── membership-status.enum.ts
│
└── config/
    ├── database.config.ts
    ├── jwt.config.ts
    └── app.config.ts
```

---

## 5. Frontend Folder Structure (`apps/web/src/`)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (owner)/                      # Owner portal
│   │   ├── layout.tsx                # Sidebar + topbar shell
│   │   ├── dashboard/page.tsx
│   │   ├── packages/page.tsx
│   │   ├── members/
│   │   │   ├── page.tsx              # Directory
│   │   │   └── [id]/page.tsx         # Profile
│   │   ├── followups/page.tsx
│   │   ├── staff/page.tsx
│   │   ├── finance/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── workout-plans/page.tsx
│   │   ├── diet-plans/page.tsx
│   │   ├── support/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── (manager)/                    # Manager portal (same shell, fewer pages)
│   ├── (frontdesk)/                  # Front-desk portal
│   ├── (trainer)/                    # Trainer portal
│   ├── (member)/                     # Member PWA
│   │   ├── layout.tsx                # Mobile-first shell
│   │   ├── dashboard/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── classes/page.tsx
│   │   ├── trainers/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── fitness/page.tsx
│   │   └── profile/page.tsx
│   │
│   └── (public)/                     # No auth
│       ├── join/[gymSlug]/page.tsx
│       └── enquiry/[gymSlug]/page.tsx
│
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── DuesDrawer.tsx
│   ├── members/
│   ├── payments/
│   ├── attendance/
│   ├── fitness/
│   └── charts/                       # Recharts wrappers
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   └── useDebounce.ts
│
├── lib/
│   ├── api.ts                        # Fetch wrapper (credentials: include)
│   ├── auth.ts                       # Token helpers
│   └── formatters.ts                 # Rupee, paise, Indian digit grouping
│
└── middleware.ts                     # Redirect unauthenticated users
```

---

## 6. Security Standards

### 6.1 Authentication
- **OTP-based login**: 6-digit code, 5-minute TTL, 5 attempts max, 30-second resend cooldown
- **JWT tokens** stored in **HTTP-only, Secure, SameSite=Strict cookies** — never in localStorage
- **Access token**: 15 minutes TTL
- **Refresh token**: 7 days TTL, rotated on each use, stored in cookie + DB for revocation
- Pretend mode: OTP printed to server log, no SMS sent

```typescript
// main.ts bootstrap
app.use(cookieParser());
app.use(helmet());
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // strip unknown fields
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### 6.2 Authorization
- **RolesGuard** — checks `@Roles(Role.OWNER, Role.MANAGER)` decorator on every endpoint
- **SpecialActionGuard** — for actions like back-dating, export, phone-number change
- Permissions stored in Settings document, loaded per-request via guard
- Hidden in UI AND blocked on the server (both enforced)

### 6.3 Rate Limiting
```typescript
// @nestjs/throttler
ThrottlerModule.forRoot([
  { name: 'global', ttl: 60_000, limit: 100 },
  { name: 'auth',   ttl: 60_000, limit: 10 },  // OTP endpoints
])
```

### 6.4 Input Sanitization
- `class-validator` with `@IsString()`, `@IsMongoId()`, `@IsInt()`, `@Min()`, `@Max()` on all DTOs
- `class-transformer` with `@Transform()` to sanitize and strip
- All Mongoose queries use parameterized field names — no string interpolation into queries
- File uploads validated by MIME type and size (multer + sharp)

### 6.5 Additional Defenses
- `helmet()` sets `Content-Security-Policy`, `X-Frame-Options`, `X-XSS-Protection`
- MongoDB query operators (`$where`, `$regex`) never constructed from raw user input
- `bcrypt` (12 rounds) for any stored secrets (Razorpay keys encrypted at rest)
- Audit log is append-only — no update or delete operations on `audit_logs` collection

---

## 7. MongoDB Schema Design

### Money rule
All monetary values stored as **integer paise** (₹1 = 100 paise). Display layer converts.

### Key Schemas

#### User (staff + owner accounts)
```
users
  _id         ObjectId
  phone       String (unique, indexed)
  name        String
  role        Enum [owner, manager, frontdesk, trainer]
  isActive    Boolean
  photo       String (URL)
  joiningDate Date
  staffCode   String
  createdAt   Date
  updatedAt   Date

Indexes: { phone: 1 } unique
```

#### Member
```
members
  _id             ObjectId
  code            String (unique, e.g. "GYM0001")
  name            String
  phone           String (unique, indexed)
  email           String
  gender          Enum
  dateOfBirth     Date
  photo           String
  status          Enum [pending, active, inactive, archived, blocked]
  referenceSource Enum
  salesPersonId   ObjectId → users
  consentSigned   Boolean
  consentPdfUrl   String
  idProofUrl      String
  emergencyContact { name, phone }
  address         String
  ageGroup        Enum
  biometric       { fingerprint: Boolean, face: Boolean, pin: Boolean }
  createdAt       Date
  updatedAt       Date

Indexes:
  { phone: 1 } unique
  { code: 1 } unique
  { status: 1 }
  { "memberships.endDate": 1 }  — for expiry job
```

#### Package (template — what the gym sells)
```
packages
  _id           ObjectId
  name          String
  priceInPaise  Number (integer)
  durationDays  Number
  type          Enum [membership, pt, sunnyHour]
  sessions      Number (PT only)
  sunnyHourFrom String (HH:MM, Sunny Hour only)
  sunnyHourTo   String
  description   String
  features      [String]
  showOnline    Boolean
  isArchived    Boolean
  createdAt     Date

Indexes: { isArchived: 1 }, { type: 1 }
```

#### Membership (sold instance)
```
memberships
  _id             ObjectId
  memberId        ObjectId → members (indexed)
  packageId       ObjectId → packages
  packageSnapshot Object (name, price at time of sale — never mutate)
  salePriceInPaise Number
  startDate       Date
  endDate         Date
  status          Enum [upcoming, active, frozen, expired, completed, transferred, cancelled]
  trainerId       ObjectId → users
  salesPersonId   ObjectId → users
  discountId      ObjectId → discounts
  freezes         [{ startDate, days, feeInPaise, paymentMethod }]
  sessionsTotal   Number
  sessionsDone    Number
  linkedFrom      ObjectId (upgrade chain)
  linkedTo        ObjectId
  notes           String
  createdAt       Date
  updatedAt       Date

Indexes:
  { memberId: 1 }
  { status: 1 }
  { endDate: 1 }          — expiry job
  { memberId: 1, status: 1 }
```

#### Payment
```
payments
  _id           ObjectId
  membershipId  ObjectId → memberships (indexed)
  memberId      ObjectId → members (indexed)
  entries       [{ method: Enum, amountInPaise: Number, txRef: String }]
  totalInPaise  Number
  date          Date
  isBackdated   Boolean
  receivedById  ObjectId → users
  notes         String
  invoiceId     ObjectId → invoices
  isDeleted     Boolean
  createdAt     Date

Indexes: { memberId: 1 }, { membershipId: 1 }, { date: 1 }
```

#### Attendance
```
attendance
  _id         ObjectId
  memberId    ObjectId → members (indexed)
  staffId     ObjectId → users (for staff check-in)
  checkIn     Date (UTC, indexed)
  checkOut    Date
  source      Enum [manual, self, biometric]
  notes       String
  isEdited    Boolean

Indexes:
  { memberId: 1, checkIn: -1 }
  { checkIn: 1 }                — for daily counts
```

#### FollowUp
```
followups
  _id          ObjectId
  contactId    ObjectId → members or visitors (indexed)
  contactType  Enum [member, visitor]
  subject      String
  type         Enum [payment, renewal, visitor, inquiry, attendance]
  priority     Enum [normal, critical]
  assignedToId ObjectId → users
  amountInPaise Number
  dueDate      Date (indexed)
  status       Enum [open, completed]
  history      [{ note, changedById, changedAt }]
  closingNote  String
  createdAt    Date

Indexes: { status: 1 }, { dueDate: 1 }, { assignedToId: 1 }
```

#### AuditLog (append-only)
```
audit_logs
  _id        ObjectId
  actorId    ObjectId → users
  actorName  String (denormalized — user may be deleted)
  action     String  (e.g. "member.created", "payment.deleted")
  targetId   ObjectId
  targetType String
  before     Object (snapshot)
  after      Object (snapshot)
  ip         String
  createdAt  Date (indexed)

Indexes: { targetId: 1 }, { actorId: 1 }, { createdAt: -1 }
No updates. No deletes. Ever.
```

#### Settings (singleton document)
```
settings
  _id                 ObjectId
  gymName             String
  ownerName           String
  email               String
  phone               String
  address             String
  city                String
  memberIdPrefix      String (2-6 capital letters)
  memberIdCounter     Number
  logoUrl             String
  gstNumber           String
  sgstPercent         Number
  cgstPercent         Number
  timezone            String (default: "Asia/Kolkata")
  currency            String (default: "INR")
  termsAndConditions  String
  autoCheckoutMinutes Number (default 60)
  freezeSettings      { allowUnlimited: Boolean, minDays: Number, maxDays: Number }
  permissions         { manager: PermMap, frontdesk: PermMap, trainer: PermMap }
  smsEnabled          Boolean
  whatsappEnabled     Boolean
  emailEnabled        Boolean
  smsCredits          Number
  emailCredits        Number
  pretendMode         Boolean (default true in dev)
  razorpayKeyId       String (encrypted)
  razorpayKeySecret   String (encrypted)
  dailyPulseNumbers   [String]
  createdAt           Date
  updatedAt           Date
```

---

## 8. NestJS MVC Pattern Example

```typescript
// members.controller.ts
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.FRONTDESK)
  async create(@Body() dto: CreateMemberDto, @CurrentUser() user: UserPayload) {
    return this.membersService.create(dto, user);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.FRONTDESK)
  findOne(@Param('id', ObjectIdPipe) id: string) {
    return this.membersService.findById(id);
  }
}

// members.service.ts
@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepo: MembersRepository,
    private readonly auditService: AuditService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(dto: CreateMemberDto, actor: UserPayload) {
    const settings = await this.settingsService.get();
    if (!settings.memberIdPrefix) throw new BadRequestException('ID prefix not set');
    // business logic here — service owns it
    const member = await this.membersRepo.create({ ...dto, code: this.generateCode(settings) });
    await this.auditService.log({ action: 'member.created', targetId: member._id, actorId: actor.sub });
    return member;
  }
}

// members.repository.ts
@Injectable()
export class MembersRepository {
  constructor(@InjectModel(Member.name) private model: Model<Member>) {}

  async create(data: Partial<Member>): Promise<Member> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<Member | null> {
    return this.model.findById(id).exec();
  }

  async findActive(): Promise<Member[]> {
    return this.model.find({ status: 'active' }).exec();
  }
}
```

---

## 9. DTO Example with Validation

```typescript
// create-member.dto.ts
import { IsString, IsEnum, IsMobilePhone, IsOptional, IsDateString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  name: string;

  @IsMobilePhone('en-IN')
  phone: string;

  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'])
  gender: string;

  @IsOptional()
  @IsEnum(['walk_in', 'social_media', 'referral', 'online', 'advertisement', 'other'])
  referenceSource?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
```

---

## 10. Build Phases (from Brief)

| Phase | Feature Set | Priority |
|-------|-------------|----------|
| 0 | Scaffold, MongoDB replica set, env setup | Now |
| 1 | Auth (OTP), roles, permissions, app shell | Now |
| 2 | Packages, members/visitors, add flow, invoices | Now |
| 3 | Membership lifecycle (freeze, upgrade, transfer) | Core |
| 4 | Attendance, follow-ups, dashboards | Core |
| 5 | Finance, analytics, expenses, petty cash, inventory | Core |
| 6 | Staff, payroll, classes, PT assignments | Core |
| 7 | Fitness: exercises, workout/diet plans, AI mock | Core |
| 8 | Communications, settings, support, daily pulse | Core |
| 9 | Biometric device integration + simulator | Later |
| 10 | Online payments (Razorpay) | Later |
| 11 | Member PWA, trainer portal, public pages | Later |
| 13 | Hardening: rate limits, indexes, E2E tests | Last |

---

## 11. Initial Scaffold Commands

Run these in order from your terminal:

```bash
# 1. Prerequisites (install once)
npm install -g pnpm turbo

# 2. Create monorepo root
mkdir gymdesk && cd gymdesk
git init
pnpm init

# 3. Create pnpm-workspace.yaml
echo "packages:\n  - 'apps/*'\n  - 'packages/*'" > pnpm-workspace.yaml

# 4. Scaffold Next.js frontend
pnpm create next-app apps/web --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint

# 5. Scaffold NestJS backend
pnpm dlx @nestjs/cli new apps/api --package-manager pnpm --language typescript --skip-git

# 6. Create shared package
mkdir -p packages/shared/src
echo '{ "name": "@gymdesk/shared", "version": "0.0.1", "main": "src/index.ts" }' > packages/shared/package.json

# 7. Install API dependencies
cd apps/api
pnpm add @nestjs/mongoose mongoose @nestjs/jwt @nestjs/passport passport passport-jwt cookie-parser helmet @nestjs/throttler class-validator class-transformer bcryptjs
pnpm add @nestjs/schedule @nestjs/config
pnpm add -D @types/passport-jwt @types/cookie-parser @types/bcryptjs

# 8. Install frontend dependencies  
cd ../web
pnpm add axios js-cookie
pnpm add -D @types/js-cookie

# 9. Create turbo.json at root
cd ../..
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "lint": {}
  }
}
EOF

# 10. Root package.json scripts
cat > package.json << 'EOF'
{
  "name": "gymdesk",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
EOF

# 11. Install all deps from root
pnpm install

# 12. Start MongoDB replica set (local dev — Docker)
docker run -d --name gymdesk-mongo \
  -p 27017:27017 \
  mongo:7 mongod --replSet rs0

docker exec gymdesk-mongo mongosh --eval "rs.initiate()"

# 13. Copy env example
cp .env.example apps/api/.env
```

### `.env.example`
```env
# Database
MONGODB_URI=mongodb://localhost:27017/gymdesk?replicaSet=rs0

# JWT
JWT_SECRET=change_me_in_production_use_256bit_random
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# App
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development

# Pretend mode (set to false to use real providers)
PRETEND_MODE=true

# SMS (MSG91) — only needed when PRETEND_MODE=false
MSG91_AUTH_KEY=
MSG91_SENDER_ID=

# WhatsApp (Meta Cloud API) — only needed when PRETEND_MODE=false
META_WHATSAPP_TOKEN=
META_PHONE_NUMBER_ID=

# Email (SMTP) — only needed when PRETEND_MODE=false
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Razorpay — only needed when PRETEND_MODE=false
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 12. Key Architectural Decisions

| # | Decision | Reason |
|---|----------|--------|
| 1 | Single gym — no multi-tenancy | Owner confirmed single-gym scope |
| 2 | OTP login (no password) | Matches reference product; mobile-first |
| 3 | JWT in HTTP-only cookies | Prevents XSS token theft |
| 4 | MongoDB replica set (local) | Required for multi-document transactions |
| 5 | Money stored as integer paise | Eliminates floating-point rounding errors |
| 6 | Times in UTC, display in IST | Standard for Indian deployments |
| 7 | Pretend mode for all external services | Entire app runs on laptop with no accounts |
| 8 | Repository pattern in NestJS | Services never touch Mongoose directly; easy to test |
| 9 | Audit log is append-only | No UPDATE or DELETE on audit_logs ever |
| 10 | Package snapshot on sale | Price changes to a template don't affect past sales |
| 11 | MVC (not DDD/hexagonal) | Simpler, fits NestJS naturally, sufficient for this scale |
| 12 | Member codes = prefix + padded counter | Gym-specific, human-readable, set in Settings |

---

## 13. What Comes Next

1. **Review this document** — confirm any changes
2. **Phase 0**: `pnpm dev` must start both apps with DB connected
3. **Phase 1**: Auth module — OTP flow, JWT cookies, roles guard, settings seed
4. Tackle phases 2–8 in order, confirming each phase works before the next
