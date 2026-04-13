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
  common/
    decorators/                 # @Roles, @ResponseMessage, @CurrentUser
    dto/                        # PaginationQueryDto
    filters/                    # Global exception filter
    guards/                     # JWT auth & role guards
    interceptors/               # Response transformation
    interfaces/                 # Shared interfaces & types
    middleware/                  # HTTP logger middleware
    strategies/                 # Passport JWT strategy
  modules/
    auth/                       # Register & login
    users/                      # User entity & service
    grocery/                    # Grocery items CRUD + inventory
      controllers/
        internal/               # Admin: /internal/grocery
        web/                    # User: /grocery
    categories/                 # Hierarchical grocery categories
      controllers/
        internal/               # Admin: /internal/categories
        web/                    # User: /categories
    cart/                       # Shopping cart + checkout
      controllers/
        web/                    # User: /cart
    orders/                     # Order management + status transitions
      controllers/
        internal/               # Admin: /internal/orders
        web/                    # User: /orders
    delivery/                   # Delivery zones & charges
      controllers/
        internal/               # Admin: /internal/delivery-zones
        web/                    # User: /delivery-zones
    addresses/                  # User saved delivery addresses
      controllers/
        web/                    # User: /addresses
    payment/                    # Payment processing (strategy pattern)
      controllers/
        internal/               # Admin: /internal/payments
        web/                    # User: /payments
      providers/                # COD provider (extensible for Stripe, bKash, etc.)
    invoice/                    # Auto-generated invoices (INV-YYYYMMDD-NNNN)
      controllers/
        internal/               # Admin: /internal/invoices
        web/                    # User: /invoices
    order-timeline/             # Order tracking timeline
      controllers/
        web/                    # User: /orders/:id/timeline
    coupons/                    # Promo codes & discounts
      controllers/
        internal/               # Admin: /internal/coupons
        web/                    # User: /coupons/validate
  app.module.ts
  main.ts
```

## Key Features

- **JWT Authentication** with role-based access control (Admin / User)
- **Delivery Zones** — admin-configurable zones with charges and estimated delivery times
- **Delivery Addresses** — save addresses during checkout, manage saved addresses
- **Payment System** — Cash on Delivery with strategy pattern extensible for Stripe, SSLCommerce, bKash, Nagad
- **Invoice System** — auto-generated invoices with sequential numbering (INV-YYYYMMDD-NNNN)
- **Order Management** — status transitions (Pending → Confirmed → Processing → Out for Delivery → Delivered), cancellation with inventory restore
- **Order Timeline** — tracking history for every status change
- **Promo Codes / Coupons** — flat or percentage discounts, usage limits, per-user tracking, min order amount
- **Grocery Categories** — hierarchical parent/child categories with slug-based identification
- **Shopping Cart** — persistent cart with add/update/remove items and checkout
- **Transactional Processing** — stock validation, inventory decrement, payment, invoice, and timeline creation within DB transactions
- **Pagination** — configurable `page`, `limit`, `sortBy`, `sortOrder` on all list endpoints
- **Search & Filtering** — full-text search and field-specific filters
- **Standardized API Response Envelope** — `{ statusCode, message, data, timestamp }`
- **Global Exception Handling** — consistent error format across all endpoints
- **Swagger Documentation** — interactive API docs at `/api/docs`
- **CI/CD** — GitHub Actions pipeline with zero-downtime blue-green deployment

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

The API will be available at `http://localhost:3000`.

Swagger docs: **http://localhost:3000/api/docs**

PgAdmin: **http://localhost:5050** (dev only)

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register a new user |
| POST | `/auth/login` | - | Login and receive JWT token |

### Internal — Grocery Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/internal/grocery` | Add new grocery item |
| GET | `/internal/grocery` | List all items (paginated, filterable) |
| GET | `/internal/grocery/:id` | Get item by ID |
| PATCH | `/internal/grocery/:id` | Update item details |
| DELETE | `/internal/grocery/:id` | Remove item |
| PATCH | `/internal/grocery/:id/inventory` | Update inventory quantity |

### Internal — Categories (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/internal/categories` | Create a new category |
| GET | `/internal/categories` | List all categories (including inactive) |
| GET | `/internal/categories/:id` | Get category by ID |
| PATCH | `/internal/categories/:id` | Update a category |
| DELETE | `/internal/categories/:id` | Remove a category |

### Internal — Delivery Zones (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/internal/delivery-zones` | Create a delivery zone |
| GET | `/internal/delivery-zones` | List all delivery zones |
| GET | `/internal/delivery-zones/:id` | Get delivery zone by ID |
| PATCH | `/internal/delivery-zones/:id` | Update a delivery zone |
| DELETE | `/internal/delivery-zones/:id` | Delete a delivery zone |

### Internal — Orders (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/internal/orders` | List all orders (paginated, filterable) |
| GET | `/internal/orders/:id` | Get order details |
| PATCH | `/internal/orders/:id/status` | Update order status |

### Internal — Payments (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/internal/payments` | List all payments |
| GET | `/internal/payments/:id` | Get payment details |
| PATCH | `/internal/payments/:id/status` | Update payment status |
| POST | `/internal/payments/:id/refund` | Initiate a refund |

### Internal — Invoices (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/internal/invoices` | List all invoices |
| GET | `/internal/invoices/:id` | Get invoice details |

### Internal — Coupons (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/internal/coupons` | Create a coupon |
| GET | `/internal/coupons` | List all coupons |
| GET | `/internal/coupons/:id` | Get coupon by ID |
| PATCH | `/internal/coupons/:id` | Update a coupon |
| DELETE | `/internal/coupons/:id` | Delete a coupon |

### Web — Grocery (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/grocery` | List available grocery items (paginated, filterable) |

### Web — Categories (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List active categories (nested tree) |

### Web — Delivery Zones (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/delivery-zones` | List active delivery zones |

### Web — Addresses (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/addresses` | List saved addresses |
| GET | `/addresses/:id` | Get a saved address |
| PATCH | `/addresses/:id` | Update a saved address |
| DELETE | `/addresses/:id` | Delete a saved address |

### Web — Cart (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get current cart |
| POST | `/cart/items` | Add item to cart |
| PATCH | `/cart/items/:id` | Update cart item quantity |
| DELETE | `/cart/items/:id` | Remove item from cart |
| DELETE | `/cart` | Clear entire cart |
| POST | `/cart/checkout` | Checkout cart into an order |

### Web — Orders (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order directly with items |
| GET | `/orders/my` | Get own orders (paginated, filterable) |
| GET | `/orders/:orderId/timeline` | Get order tracking timeline |

### Web — Payments (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/order/:orderId` | Get payment for a specific order |
| GET | `/payments/my` | Get payment history |

### Web — Invoices (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices/order/:orderId` | Get invoice for a specific order |
| GET | `/invoices/my` | Get my invoices |

### Web — Coupons (User)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/coupons/validate` | Validate a coupon code and preview discount |

---

## Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → OUT_FOR_DELIVERY → DELIVERED
   ↓          ↓           ↓
CANCELLED  CANCELLED   CANCELLED
```

- On **DELIVERED** (COD): payment auto-marked as completed, invoice paid amount updated
- On **CANCELLED**: inventory automatically restored

---

## Checkout Flow

Both `/orders` (direct) and `/cart/checkout` support the same options:

```json
{
  "items": [{ "groceryItemId": "uuid", "quantity": 2 }],
  "deliveryZoneId": "uuid",
  "deliveryAddressId": "uuid",
  "deliveryAddress": { "street": "...", "city": "...", "state": "...", "postalCode": "...", "country": "..." },
  "saveAddress": true,
  "addressLabel": "Home",
  "paymentMethod": "cash_on_delivery",
  "couponCode": "SAVE10",
  "notes": "Leave at the door"
}
```

- Provide either `deliveryAddressId` (saved address) or `deliveryAddress` (inline)
- Set `saveAddress: true` to save the inline address for future use
- `couponCode` validates and applies discount within the transaction
- Creates: Order + OrderItems + Payment + Invoice + Timeline entry (all transactional)

---

## Pagination & Filtering

All list endpoints support:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `sortBy` | string | createdAt | Field to sort by |
| `sortOrder` | ASC/DESC | DESC | Sort direction |
| `search` | string | - | Search keyword |

**Grocery filters:** `minPrice`, `maxPrice`, `isAvailable`, `categoryId`

**Order filters:** `status`, `fromDate`, `toDate`

**Invoice filters:** `paymentMethod`, `fromDate`, `toDate`

**Payment filters:** `status`, `paymentMethod`

---

## Response Format

**Success:**
```json
{
  "statusCode": 200,
  "message": "Grocery items retrieved successfully",
  "data": {
    "items": [],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2026-04-12T12:00:00.000Z"
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "price must be a number"],
  "data": null,
  "timestamp": "2026-04-12T12:00:00.000Z"
}
```

---

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | |
| email | VARCHAR | Unique |
| password | VARCHAR | Bcrypt hashed, excluded from queries |
| role | ENUM | `admin` \| `user` (default: `user`) |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | |
| description | TEXT | Nullable |
| imageUrl | VARCHAR | Nullable |
| slug | VARCHAR | Unique |
| parentId | UUID | FK → categories (self-referencing, nullable) |
| isActive | BOOLEAN | Default: true |
| sortOrder | INT | Default: 0 |

### grocery_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | |
| description | TEXT | Nullable |
| price | DECIMAL(10,2) | |
| quantity | INT | Inventory stock count |
| imageUrl | VARCHAR | Nullable |
| categoryId | UUID | FK → categories (nullable) |
| isAvailable | BOOLEAN | Auto-set based on quantity > 0 |

### delivery_zones
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | |
| charge | DECIMAL(10,2) | Delivery fee |
| estimatedMinutes | INT | Nullable |
| isActive | BOOLEAN | Default: true |

### user_addresses
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK → users |
| label | VARCHAR | Nullable (e.g. "Home", "Office") |
| street | VARCHAR | |
| city | VARCHAR | |
| state | VARCHAR | |
| postalCode | VARCHAR | |
| country | VARCHAR | |
| isDefault | BOOLEAN | Default: false |

### orders
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK → users |
| status | ENUM | `pending` \| `confirmed` \| `processing` \| `out_for_delivery` \| `delivered` \| `cancelled` |
| subtotalAmount | DECIMAL(10,2) | Sum of item subtotals |
| deliveryCharge | DECIMAL(10,2) | From delivery zone |
| discountAmount | DECIMAL(10,2) | Coupon discount (default: 0) |
| couponCode | VARCHAR | Nullable |
| totalAmount | DECIMAL(10,2) | subtotal + delivery - discount |
| deliveryZoneName | VARCHAR | Snapshot |
| deliveryStreet | VARCHAR | Snapshot |
| deliveryCity | VARCHAR | Snapshot |
| deliveryState | VARCHAR | Snapshot |
| deliveryPostalCode | VARCHAR | Snapshot |
| deliveryCountry | VARCHAR | Snapshot |
| notes | VARCHAR | Nullable |
| estimatedDeliveryTime | TIMESTAMP | Nullable |

### order_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| orderId | UUID | FK → orders (CASCADE) |
| groceryItemId | UUID | FK → grocery_items |
| quantity | INT | |
| priceAtOrder | DECIMAL(10,2) | Price snapshot at order time |
| subtotal | DECIMAL(10,2) | priceAtOrder × quantity |

### payments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| orderId | UUID | FK → orders (OneToOne) |
| userId | UUID | FK → users |
| paymentMethod | ENUM | `cash_on_delivery` \| `stripe` \| `ssl_commerce` \| `bkash` \| `nagad` |
| status | ENUM | `pending` \| `completed` \| `failed` \| `refunded` \| `partially_refunded` |
| amount | DECIMAL(10,2) | |
| transactionId | VARCHAR | Nullable |
| refundedAmount | DECIMAL(10,2) | Default: 0 |
| metadata | JSONB | Nullable |
| paidAt | TIMESTAMP | Nullable |

### refunds
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| paymentId | UUID | FK → payments |
| amount | DECIMAL(10,2) | |
| reason | VARCHAR | |
| status | ENUM | `pending` \| `completed` \| `failed` |
| refundTransactionId | VARCHAR | Nullable |

### invoices
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| invoiceNumber | VARCHAR | Unique (INV-YYYYMMDD-NNNN) |
| orderId | UUID | FK → orders (OneToOne) |
| userId | UUID | FK → users |
| subtotalAmount | DECIMAL(10,2) | |
| deliveryCharge | DECIMAL(10,2) | |
| discountAmount | DECIMAL(10,2) | Default: 0 |
| totalAmount | DECIMAL(10,2) | |
| paidAmount | DECIMAL(10,2) | Default: 0 |
| paymentMethod | ENUM | Same as payments |
| issuedDate | DATE | |

### order_timeline
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| orderId | UUID | FK → orders |
| status | ENUM | Order status at this point |
| note | VARCHAR | Nullable |
| changedBy | UUID | Nullable (userId) |
| createdAt | TIMESTAMP | |

### coupons
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| code | VARCHAR | Unique, uppercase |
| discountType | ENUM | `flat` \| `percentage` |
| discountValue | DECIMAL(10,2) | |
| minOrderAmount | DECIMAL(10,2) | Nullable |
| maxDiscountAmount | DECIMAL(10,2) | Nullable (caps percentage discounts) |
| usageLimit | INT | Nullable |
| usedCount | INT | Default: 0 |
| validFrom | DATE | |
| validTo | DATE | |
| isActive | BOOLEAN | Default: true |

### coupon_usages
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| couponId | UUID | FK → coupons |
| userId | UUID | |
| orderId | UUID | |
| discountApplied | DECIMAL(10,2) | |

### carts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK → users (OneToOne) |

### cart_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| cartId | UUID | FK → carts (CASCADE) |
| groceryItemId | UUID | FK → grocery_items |
| quantity | INT | |

> **Note:** `synchronize: true` is enabled for development. Use TypeORM migrations for production deployments.

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
3. `mkdir -p ~/deploy/grocery-booking-system`

The pipeline handles everything else automatically on first deploy.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start:prod` | Start from compiled build |
| `npm run build` | Compile TypeScript to dist/ |
