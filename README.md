# Grocery Booking System API

A production-ready RESTful API for managing grocery items, shopping carts, and order processing. Built with **NestJS**, **TypeORM**, and **PostgreSQL**, featuring JWT authentication, role-based access control, and a professional modular architecture.

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

## Architecture

```
src/
  common/                                  # Cross-cutting concerns
    decorators/                            # Custom decorators (@Roles, @ResponseMessage)
    dto/                                   # Reusable DTOs (PaginationQueryDto)
    filters/                               # Global exception filters
    guards/                                # Auth & role guards
    interceptors/                          # Response transformation
    interfaces/                            # Shared interfaces & types
    middleware/                            # HTTP logger middleware
    strategies/                            # Passport JWT strategy
  modules/
    auth/
      controllers/                         # Auth endpoints
      dto/                                 # Login & Register DTOs
      services/                            # Auth business logic
    users/
      entities/                            # User entity
      services/                            # User CRUD operations
    grocery/
      controllers/
        internal/                          # Admin endpoints (/internal/grocery)
        web/                               # User-facing endpoints (/grocery)
      dto/                                 # Grocery DTOs + query filters
      entities/                            # GroceryItem entity
      services/                            # Grocery business logic
    orders/
      controllers/
        web/                               # User-facing endpoints (/orders)
      dto/                                 # Order DTOs + query filters
      entities/                            # Order & OrderItem entities
      services/                            # Order business logic (transactional)
    cart/
      controllers/
        web/                               # User-facing endpoints (/cart)
      dto/                                 # Cart DTOs
      entities/                            # Cart & CartItem entities
      services/                            # Cart + checkout logic (transactional)
  app.module.ts                            # Root module with middleware config
  main.ts                                  # Bootstrap, global pipes/interceptors/filters
```

## Key Features

- **JWT Authentication** with role-based access control (Admin / User)
- **Standardized API Response Envelope** — all responses wrapped in `{ statusCode, message, data, timestamp }`
- **Global Exception Handling** — catches all exceptions with consistent error format
- **Pagination** — configurable `page`, `limit`, `sortBy`, `sortOrder` on all list endpoints
- **Search & Filtering** — full-text search and field-specific filters
- **Shopping Cart** — persistent cart with add/update/remove items and checkout
- **Transactional Order Processing** — stock validation, inventory decrement, and order creation within DB transactions
- **HTTP Request Logging** — middleware logs method, URL, status, and duration
- **Swagger Documentation** — interactive API docs with request/response schemas

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
DB_HOST=localhost
DB_PORT=5432
DB_USER=grocery_user
DB_PASS=grocery_pass
DB_NAME=grocery_db
JWT_SECRET=supersecretkey_change_in_production
JWT_EXPIRES_IN=7d
PORT=3000
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

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register a new user |
| POST | `/auth/login` | - | Login and receive JWT token |

### Internal (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/internal/grocery` | JWT (admin) | Add new grocery item |
| GET | `/internal/grocery` | JWT (admin) | List all items (paginated, filterable) |
| GET | `/internal/grocery/:id` | JWT (admin) | Get item by ID |
| PATCH | `/internal/grocery/:id` | JWT (admin) | Update item details |
| DELETE | `/internal/grocery/:id` | JWT (admin) | Remove item |
| PATCH | `/internal/grocery/:id/inventory` | JWT (admin) | Update inventory quantity |

### Web (User)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/grocery` | JWT (user) | List available items (paginated, filterable) |
| POST | `/orders` | JWT (user) | Create order directly with items |
| GET | `/orders/my` | JWT (user) | Get own orders (paginated, filterable) |
| GET | `/cart` | JWT (user) | Get current cart |
| POST | `/cart/items` | JWT (user) | Add item to cart |
| PATCH | `/cart/items/:id` | JWT (user) | Update cart item quantity |
| DELETE | `/cart/items/:id` | JWT (user) | Remove item from cart |
| DELETE | `/cart` | JWT (user) | Clear entire cart |
| POST | `/cart/checkout` | JWT (user) | Checkout cart into an order |

### Pagination & Filtering

All list endpoints support these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `sortBy` | string | createdAt | Field to sort by |
| `sortOrder` | ASC/DESC | DESC | Sort direction |
| `search` | string | - | Search keyword |

**Grocery-specific filters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `isAvailable` | boolean | Filter by availability |

**Order-specific filters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | `pending`, `confirmed`, `cancelled` |
| `fromDate` | ISO date | Orders created after this date |
| `toDate` | ISO date | Orders created before this date |

### Response Format

All responses follow a standardized envelope:

**Success:**
```json
{
  "statusCode": 200,
  "message": "Grocery items retrieved successfully",
  "data": {
    "items": [...],
    "meta": {
      "page": 1,
      "limit": 10,
      "totalItems": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "price must be a number"],
  "data": null,
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

---

## Usage Examples

### Register & Login

```bash
# Register as admin
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"admin123","role":"admin"}'

# Register as user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","password":"user123"}'

# Login (returns JWT token)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### Manage Grocery Items (Admin)

```bash
# Add item
curl -X POST http://localhost:3000/internal/grocery \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"name":"Organic Bananas","description":"Fresh organic bananas","price":2.99,"quantity":100}'

# Search with filters
curl "http://localhost:3000/internal/grocery?search=banana&minPrice=1&maxPrice=5&page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Update inventory
curl -X PATCH http://localhost:3000/internal/grocery/<ITEM_ID>/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"quantity":200}'
```

### Shopping Cart Flow (User)

```bash
# Add item to cart
curl -X POST http://localhost:3000/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{"groceryItemId":"<ITEM_UUID>","quantity":3}'

# View cart
curl http://localhost:3000/cart \
  -H "Authorization: Bearer <USER_TOKEN>"

# Update quantity
curl -X PATCH http://localhost:3000/cart/items/<CART_ITEM_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{"quantity":5}'

# Checkout (creates order, clears cart)
curl -X POST http://localhost:3000/cart/checkout \
  -H "Authorization: Bearer <USER_TOKEN>"
```

### View Orders (User)

```bash
# Get orders with filters
curl "http://localhost:3000/orders/my?status=pending&sortBy=totalAmount&sortOrder=DESC&page=1&limit=5" \
  -H "Authorization: Bearer <USER_TOKEN>"
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
| createdAt | TIMESTAMP | Auto-generated |
| updatedAt | TIMESTAMP | Auto-updated |

### grocery_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | |
| description | TEXT | Nullable |
| price | DECIMAL(10,2) | |
| quantity | INT | Inventory stock count |
| imageUrl | VARCHAR | Nullable |
| isAvailable | BOOLEAN | Auto-set based on quantity > 0 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### orders
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK -> users |
| status | ENUM | `pending` \| `confirmed` \| `cancelled` |
| totalAmount | DECIMAL(10,2) | Sum of order item subtotals |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### order_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| orderId | UUID | FK -> orders (CASCADE delete) |
| groceryItemId | UUID | FK -> grocery_items |
| quantity | INT | |
| priceAtOrder | DECIMAL(10,2) | Price snapshot at order time |
| subtotal | DECIMAL(10,2) | priceAtOrder * quantity |

### carts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK -> users (OneToOne) |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### cart_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| cartId | UUID | FK -> carts (CASCADE delete) |
| groceryItemId | UUID | FK -> grocery_items |
| quantity | INT | |

> **Note:** `synchronize: true` is enabled for development. Use TypeORM migrations for production deployments.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in watch mode (development) |
| `npm run start:prod` | Start from compiled build |
| `npm run build` | Compile TypeScript to dist/ |
