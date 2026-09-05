# BRANCH ASECA DANGACHUA

**Multi-School ERP + Cultural Platform + Santali Dictionary + Ol Chiki Lab**

- **Domain:** branchasecadangachua.org
- **Stack:** React 18 + TypeScript + Tailwind CSS | Node.js + Express + TypeScript | Prisma + SQLite/PostgreSQL

## Quick Start

```bash
npm run install:all    # Install dependencies
npm run db:push        # Push schema to database
npm run db:seed        # Seed demo data
npm run build          # Build both server and client
npm start              # Start on http://localhost:4000
```

## Dev Mode

```bash
npm run dev:server     # Express on :4000 (hot reload)
npm run dev:client     # Vite on :5173 (proxies /api → :4000)
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@aseca.org` | `admin@123` |
| Org Admin | `orgadmin@aseca.org` | `admin@123` |
| School Admin | `schooladmin@aseca.org` | `admin@123` |
| Principal | `principal@aseca.org` | `school@123` |
| Teacher | `teacher@aseca.org` | `school@123` |

## Features

- ✅ Multi-school management with data isolation
- ✅ Student CRUD with Aadhaar masking
- ✅ Teacher & staff management
- ✅ Role-based access control (RBAC)
- ✅ Premium public website with cultural design
- ✅ Responsive mobile-first UI
- ✅ Audit logging
- ✅ Dashboard with stats

## Strictly Excluded

- No fee/payment modules
- No hostel modules
- No payment gateways

## Environment

Copy `.env.example` to `.env` and configure:
- `DATABASE_URL` — Prisma database URL
- `JWT_SECRET` — Secret for JWT tokens
- `PORT` — Server port (default: 4000)
