# Grocery Booking System API

A production-ready RESTful API for managing grocery items, shopping carts, order processing, payments, invoices, and delivery. Built with **NestJS**, **TypeORM**, and **PostgreSQL**, featuring JWT authentication, role-based access control, and zero-downtime CI/CD deployment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 |
| Language | TypeScript 6 |
| Database | PostgreSQL 16 |
| ORM | TypeORM |
| Auth | JWT + Passport |
| Validation | class-validator / class-transformer |
| Docs | Swagger (OpenAPI 3.0) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions + Docker Hub |
| Deployment | Zero-downtime blue-green via Nginx |

## Architecture

```
src/
  common/                        # Decorators, guards, filters, interceptors, middleware
  modules/
    auth/                        # Register & login (JWT)
    users/                       # User entity & service
    grocery/                     # Grocery items CRUD + inventory management
    categories/                  # Hierarchical grocery categories (parent/child)
    cart/                        # Shopping cart + checkout
    orders/                      # Order management + status transitions
    delivery/                    # Delivery zones & charges
    addresses/                   # User saved delivery addresses
    payment/                     # Payment processing (strategy pattern)
    invoice/                     # Auto-generated invoices (INV-YYYYMMDD-NNNN)
    order-timeline/              # Order tracking timeline
    coupons/                     # Promo codes & discounts
```

All feature modules follow the **internal/web controller separation** pattern:
- `internal/` — Admin endpoints (`/internal/...`)
- `web/` — User-facing endpoints

## Key Features

- **JWT Authentication** with role-based access control (Admin / User)
- **Delivery Zones** — admin-configurable zones with charges and estimated delivery times
- **Delivery Addresses** — save addresses during checkout, manage saved addresses
- **Payment System** — Cash on Delivery with strategy pattern extensible for Stripe, SSLCommerce, bKash, Nagad
- **Invoice System** — auto-generated invoices with sequential numbering
- **Order Management** — full lifecycle (Pending → Confirmed → Processing → Out for Delivery → Delivered / Cancelled)
- **Order Timeline** — tracking history for every status change
- **Promo Codes / Coupons** — flat or percentage discounts, usage limits, per-user tracking
- **Grocery Categories** — hierarchical parent/child categories with slug-based identification
- **Shopping Cart** — persistent cart with checkout flow
- **Transactional Processing** — order, payment, invoice, and timeline creation within DB transactions
- **Pagination, Search & Filtering** — on all list endpoints
- **Standardized Response Envelope** — `{ statusCode, message, data, timestamp }`
- **Swagger Documentation** — interactive API docs with full request/response schemas

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (local or Docker)
- Docker & Docker Compose (optional)

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=grocery_user
DB_PASS=grocery_pass
DB_NAME=grocery_db
JWT_SECRET=supersecretkey_change_in_production
JWT_EXPIRES_IN=7d
```

### Run Locally

```bash
npm install
npm run start:dev
```

### Run with Docker

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000`

### API Documentation

Swagger docs: **http://localhost:3000/api/docs**

All endpoints, request/response schemas, and authentication requirements are documented interactively in Swagger.

---

## Deployment

### CI/CD Pipeline

The project uses **GitHub Actions** with zero-downtime blue-green deployment:

1. Push to `staging` → triggers pipeline
2. Build Docker image → push to Docker Hub
3. Generate production `.env` via `envsubst` from GitHub Secrets
4. SCP files (compose, env, nginx config) to VPS
5. Start new container on alternate port (3000 ↔ 3010)
6. Health check `/api/docs` → swap Nginx upstream → stop old container

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKER_HUB_USER` | Docker Hub username |
| `DOCKER_HUB_PASSWORD` | Docker Hub password/token |
| `HOST` | VPS IP/hostname |
| `USER` | SSH username |
| `SSH_KEY` | Private SSH key |
| `APP_DOMAIN` | API domain (e.g. api.yourdomain.com) |
| `DB_USER` | Production DB username |
| `DB_PASS` | Production DB password |
| `DB_NAME` | Production DB name |
| `JWT_SECRET` | Production JWT secret |

### VPS Setup (One-Time)

1. Install Docker + Docker Compose v2
2. Install Nginx

The pipeline handles everything else automatically on first deploy (directory creation, nginx config, postgres startup).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start:prod` | Start from compiled build |
| `npm run build` | Compile TypeScript to dist/ |
