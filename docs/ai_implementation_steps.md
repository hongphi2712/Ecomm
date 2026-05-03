# 🤖 FinCommerce Platform

## AI Implementation Steps – Detailed Build Plan

---

# 1. Mục tiêu của file này

File này dùng để hướng dẫn AI coding assistant như:

* GitHub Copilot
* Continue.dev
* Cursor
* Claude Code
* ChatGPT Code
* Windsurf

AI phải đọc file này cùng với:

```text
system_overview.md
business_logic.md
deployment_architecture.md
```

Mục tiêu:

```text
Build FinCommerce Platform theo từng bước nhỏ, có kiểm soát, không generate toàn bộ project một lần.
```

---

# 2. Nguyên tắc làm việc với AI

## 2.1 Không được generate full project một lần

Sai:

```text
Build full enterprise e-commerce system
```

Đúng:

```text
Build Auth Service database schema first.
Then build Auth DTO.
Then build Auth controller.
Then build Auth service logic.
```

---

## 2.2 Mỗi lần chỉ làm một phạm vi nhỏ

Mỗi task AI cần có:

```text
- Mục tiêu rõ ràng
- Input file liên quan
- Output mong muốn
- Rule nghiệp vụ
- Test case cần đạt
```

---

## 2.3 AI phải giữ consistency

AI phải luôn tuân theo:

```text
- Naming convention
- Folder structure
- DTO validation
- Error handling
- Logging
- Security rule
- Database schema
```

---

# 3. Project structure mong muốn

```text
fincommerce/
├── docs/
│   ├── system_overview.md
│   ├── business_logic.md
│   ├── deployment_architecture.md
│   └── ai_implementation_steps.md
│
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── seller-service/
│   ├── product-service/
│   ├── cart-service/
│   ├── order-service/
│   ├── inventory-service/
│   ├── promotion-service/
│   ├── payment-service/
│   ├── shipping-service/
│   ├── notification-service/
│   ├── fraud-service/
│   ├── audit-service/
│   └── search-service/
│
├── gateway/
│   └── nginx/
│
├── infrastructure/
│   ├── kafka/
│   ├── postgres/
│   ├── redis/
│   └── elasticsearch/
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

# 4. Global coding standard

## 4.1 Backend framework

Sử dụng:

```text
NodeJS + NestJS
```

---

## 4.2 Database

Sử dụng:

```text
PostgreSQL + Prisma
```

Mỗi service có thể có database schema riêng.

---

## 4.3 Communication

```text
REST API cho request đồng bộ
Kafka events cho nghiệp vụ bất đồng bộ
```

---

## 4.4 Validation

Tất cả request body phải dùng:

```text
class-validator
class-transformer
DTO
```

---

## 4.5 Error handling

Dùng NestJS exception chuẩn:

```text
BadRequestException
UnauthorizedException
ForbiddenException
NotFoundException
ConflictException
InternalServerErrorException
```

---

## 4.6 Logging

Mỗi service phải log:

```text
- requestId / correlationId
- action
- userId nếu có
- error message nếu lỗi
```

---

## 4.7 Security

Tất cả service phải support:

```text
- JWT verification
- RBAC guard nếu endpoint cần quyền
- ownership validation
- rate limit ở gateway hoặc service
```

---

# 5. Thứ tự build tổng thể

Không được nhảy lung tung.

AI phải build theo thứ tự:

```text
Phase 0: Initialize repo
Phase 1: Shared libraries
Phase 2: Auth Service
Phase 3: Early CI/CD VPS Sync
Phase 4: User Service
Phase 5: Seller Service
Phase 6: Product Service
Phase 7: Cart Service
Phase 8: Inventory Service
Phase 9: Promotion Service
Phase 10: Order Service
Phase 11: Payment Service
Phase 12: Saga + Kafka integration
Phase 13: Shipping Service
Phase 14: Notification Service
Phase 15: Fraud Detection Service
Phase 16: Audit Log Service
Phase 17: Search Service
Phase 18: API Gateway
Phase 19: Full Docker Compose
Phase 20: Testing
Phase 21: README + portfolio documentation
```

---

# 6. Phase 0 – Initialize repository

## Goal

Tạo repo base.

## Tasks

```text
1. Tạo folder fincommerce
2. Tạo folder docs
3. Tạo folder services
4. Tạo folder gateway
5. Tạo folder infrastructure
6. Tạo .env.example
7. Tạo README.md ban đầu
```

## Output expected

```text
Repo structure tồn tại đúng như mục 3.
```

---

# 7. Phase 1 – Shared libraries

## Goal

Tạo common package dùng chung giữa services.

## Folder

```text
libs/common/
```

## Cần có

```text
- constants
- enum
- custom exceptions
- response format
- correlationId middleware
- Kafka event types
- RBAC decorators
- JWT guard base
```

## Common enums

```text
UserRole:
- CUSTOMER
- SELLER
- ADMIN
- SUPPORT

OrderStatus:
- PENDING
- STOCK_RESERVED
- PAYMENT_PENDING
- PAID
- PACKING
- SHIPPING
- COMPLETED
- CANCELLED
- REFUND_REQUESTED
- REFUNDED
- FAILED
- ON_HOLD

PaymentStatus:
- INITIATED
- PROCESSING
- SUCCESS
- FAILED
- CANCELLED
- REFUNDING
- REFUNDED

ProductStatus:
- DRAFT
- PENDING_APPROVAL
- ACTIVE
- REJECTED
- BANNED
- OUT_OF_STOCK

SellerStatus:
- PENDING_REVIEW
- APPROVED
- REJECTED
- SUSPENDED
```

## Standard response

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

## Error response

```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE",
  "correlationId": "..."
}
```

---

# 8. Phase 2 – Auth Service

## Goal

Xây service xác thực và phân quyền.

## Features

```text
- Register
- Login
- Refresh token
- Logout
- 2FA OTP
- RBAC
- Login history
- Account lock after failed attempts
```

## Database tables

```text
users
refresh_tokens
otp_codes
login_history
```

## User fields

```text
id
email
passwordHash
fullName
phone
role
status
isEmailVerified
isTwoFactorEnabled
failedLoginAttempts
lockedUntil
createdAt
updatedAt
```

## Refresh token fields

```text
id
userId
tokenHash
expiresAt
revokedAt
createdAt
replacedByTokenId
```

## APIs

```text
POST /auth/register
POST /auth/login
POST /auth/verify-otp
POST /auth/refresh-token
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
```

## Register rules

```text
- Email unique
- Password min 8 chars
- Hash password using bcrypt or argon2
- Default role = CUSTOMER
- Default status = ACTIVE
```

## Login rules

```text
- Check email exists
- Check account not locked
- Validate password
- If failed 5 times → lock 15 minutes
- If role ADMIN/SELLER/SUPPORT and 2FA enabled → return OTP_REQUIRED
- Else return accessToken + refreshToken
```

## Refresh token rules

```text
- Token must exist in DB
- Token must not be revoked
- Token must not be expired
- Rotate refresh token
- Revoke old token
```

## Output expected

```text
Auth Service chạy được độc lập.
Có Swagger hoặc API docs.
Có validation đầy đủ.
```

## Test cases

```text
- Register success
- Register duplicate email fail
- Login success
- Login wrong password fail
- Account locked after 5 failed attempts
- Refresh token success
- Reuse old refresh token fail
```

---

# 9. Phase 3 – Early CI/CD VPS Sync

## Goal

Deploy Auth Service sớm lên VPS/EC2 bằng Docker Compose để test API thật trước khi build tiếp các service nghiệp vụ.

## Requirements

```text
- Repository đã push lên GitHub
- VPS/EC2 đã SSH được
- Không commit .env production hoặc .pem
- CI/CD dùng GitHub Actions secrets
- Docker Compose chạy được postgres + auth-service
- Auth Service đọc AUTH_DATABASE_URL từ env
```

## GitHub Actions secrets

```text
VPS_HOST
VPS_USER
VPS_SSH_PRIVATE_KEY
VPS_APP_DIR
```

## Output expected

```text
.github/workflows/deploy-vps.yml
services/auth-service/Dockerfile
docker-compose.yml có auth-service
Push main → deploy VPS → test GET /health và Swagger /docs
```

## Commands expected on VPS

```bash
git pull --ff-only
docker compose build auth-service
docker compose up -d postgres auth-service
docker compose ps
```

---

# 10. Phase 4 – User Service

## Goal

Quản lý profile và địa chỉ giao hàng.

## Features

```text
- Get current user profile
- Update profile
- Manage addresses
- View login devices/history
```

## Tables

```text
user_profiles
user_addresses
```

## APIs

```text
GET    /users/me
PATCH  /users/me
POST   /users/addresses
GET    /users/addresses
PATCH  /users/addresses/:id
DELETE /users/addresses/:id
```

## Rules

```text
- User chỉ sửa profile của mình
- User chỉ xem địa chỉ của mình
- Address phải có phone, province, district, ward, detail
```

---

# 10. Phase 4 – Seller Service

## Goal

Quản lý seller onboarding.

## Features

```text
- Apply seller
- Admin review seller
- Suspend seller
- Seller profile
```

## Tables

```text
seller_applications
seller_profiles
seller_status_history
```

## APIs

```text
POST /sellers/apply
GET  /sellers/me
GET  /admin/sellers/pending
POST /admin/sellers/:id/approve
POST /admin/sellers/:id/reject
POST /admin/sellers/:id/suspend
```

## Rules

```text
- Customer mới được apply seller
- Một user chỉ có một seller profile
- Admin mới được approve/reject/suspend
- Seller APPROVED mới được tạo product
```

## Events

```text
SellerApplied
SellerApproved
SellerRejected
SellerSuspended
```

---

# 11. Phase 5 – Product Service

## Goal

Quản lý sản phẩm nhiều seller.

## Features

```text
- Create product
- Update product
- Submit product for approval
- Admin approve/reject product
- Public product listing
- Product variants
- Product images
```

## Tables

```text
products
product_variants
product_images
categories
product_status_history
```

## Product fields

```text
id
sellerId
name
description
categoryId
status
basePrice
createdAt
updatedAt
```

## Variant fields

```text
id
productId
sku
name
price
attributes
status
```

## APIs

```text
POST   /products
PATCH  /products/:id
POST   /products/:id/submit
GET    /products
GET    /products/:id
POST   /admin/products/:id/approve
POST   /admin/products/:id/reject
POST   /admin/products/:id/ban
```

## Rules

```text
- Seller chỉ sửa sản phẩm của mình
- Customer chỉ xem product ACTIVE
- Seller bị SUSPENDED thì không được tạo product
- Product phải có ít nhất 1 variant
```

## Events

```text
ProductCreated
ProductSubmitted
ProductApproved
ProductRejected
ProductBanned
ProductUpdated
```

---

# 12. Phase 6 – Cart Service

## Goal

Quản lý giỏ hàng nhanh bằng Redis.

## Features

```text
- Add item to cart
- Update quantity
- Remove item
- Clear cart
- Validate cart before checkout
```

## Storage

```text
Redis key:
cart:user:{userId}
```

## Cart item

```json
{
  "productId": "P1",
  "variantId": "V1",
  "sellerId": "S1",
  "quantity": 2,
  "priceSnapshot": 100000,
  "productNameSnapshot": "Hoodie Black",
  "addedAt": "..."
}
```

## APIs

```text
GET    /cart
POST   /cart/items
PATCH  /cart/items/:variantId
DELETE /cart/items/:variantId
DELETE /cart
POST   /cart/validate
```

## Rules

```text
- Quantity > 0
- Product must be ACTIVE
- Variant must be ACTIVE
- Seller must not be SUSPENDED
- Nếu price thay đổi, validate trả PRICE_CHANGED
```

---

# 13. Phase 7 – Inventory Service

## Goal

Quản lý tồn kho và chống overselling.

## Features

```text
- Create inventory for variant
- Reserve stock
- Commit stock
- Release stock
- Stock movement history
- Reservation timeout
```

## Tables

```text
inventory_items
inventory_reservations
stock_movements
```

## Inventory fields

```text
variantId
available
reserved
sold
version
updatedAt
```

## Reservation fields

```text
id
orderId
variantId
quantity
status
expiresAt
createdAt
```

## APIs

```text
POST /inventory/items
GET  /inventory/:variantId
POST /inventory/reserve
POST /inventory/commit
POST /inventory/release
```

## Reserve rules

```text
- available >= requested quantity
- Use Redis lock or optimistic locking
- Decrease available
- Increase reserved
- Create reservation record
- Reservation expires after 15 minutes
```

## Commit rules

```text
- Reservation must exist
- Reservation status = RESERVED
- Decrease reserved
- Increase sold
- Mark reservation COMMITTED
```

## Release rules

```text
- Reservation must exist
- Reservation status = RESERVED
- Decrease reserved
- Increase available
- Mark reservation RELEASED
```

## Events

```text
InventoryReserved
InventoryReserveFailed
InventoryCommitted
InventoryReleased
```

## Test cases

```text
- Reserve success
- Reserve fail if insufficient stock
- Concurrent reserve cannot oversell
- Release returns stock
- Commit moves reserved to sold
```

---

# 14. Phase 8 – Promotion Service

## Goal

Quản lý voucher/promotion có concurrency-safe.

## Features

```text
- Create voucher
- Validate voucher
- Reserve voucher usage
- Commit voucher usage
- Release voucher usage
```

## Tables

```text
vouchers
voucher_rules
voucher_usages
voucher_reservations
```

## Voucher fields

```text
id
code
type
discountValue
maxDiscount
minOrderValue
usageLimit
usedCount
reservedCount
startAt
endAt
status
```

## APIs

```text
POST /promotions/vouchers
POST /promotions/validate
POST /promotions/reserve
POST /promotions/commit
POST /promotions/release
```

## Rules

```text
- Voucher must be ACTIVE
- Current time between startAt and endAt
- Order value >= minOrderValue
- usedCount + reservedCount < usageLimit
- One user cannot exceed usageLimitPerUser
```

## Events

```text
PromotionReserved
PromotionReserveFailed
PromotionCommitted
PromotionReleased
```

---

# 15. Phase 9 – Order Service

## Goal

Quản lý order lifecycle và điều phối checkout.

## Features

```text
- Checkout
- Create order
- Order status history
- Cancel order
- View orders
- Request refund
```

## Tables

```text
orders
order_items
order_status_history
outbox_events
```

## APIs

```text
POST /orders/checkout
GET  /orders/me
GET  /orders/:id
POST /orders/:id/cancel
POST /orders/:id/refund-request
```

## Checkout steps

```text
1. Get user cart
2. Validate cart
3. Calculate subtotal
4. Apply promotion result
5. Create order with status PENDING
6. Create order items with price snapshot
7. Save outbox event OrderCreated
8. Clear cart only after order is created successfully
```

## Order rules

```text
- Customer only views own orders
- Seller only views orders containing their products
- Admin/Support can view all
- Cannot cancel DELIVERED/REFUNDED order
```

## Outbox requirement

When creating order:

```text
- Save order
- Save outbox event
- Commit DB transaction
- Outbox worker publishes event to Kafka
```

## Events

```text
OrderCreated
OrderCancelled
OrderPaid
OrderCompleted
RefundRequested
```

---

# 16. Phase 10 – Payment Service

## Goal

Mô phỏng thanh toán fintech-style.

## Features

```text
- Create payment intent
- Process payment
- Idempotency key
- Mock bank webhook
- Refund
- Payment transaction history
```

## Tables

```text
payments
payment_transactions
refunds
idempotency_keys
outbox_events
```

## APIs

```text
POST /payments/intents
POST /payments/pay
POST /payments/webhook/mock-bank
POST /payments/:id/refund
GET  /payments/:id
```

## Payment rules

```text
- Never trust amount from client
- Amount must match order total
- Payment must use idempotency key
- Same idempotency key returns same result
- Cannot pay already paid order
- Cannot refund unpaid order
- Cannot refund twice
```

## Payment states

```text
INITIATED
PROCESSING
SUCCESS
FAILED
CANCELLED
REFUNDING
REFUNDED
```

## Events

```text
PaymentIntentCreated
PaymentSucceeded
PaymentFailed
RefundSucceeded
RefundFailed
```

## Test cases

```text
- Pay success
- Pay fail
- Duplicate payment request returns same result
- Refund success
- Double refund blocked
```

---

# 17. Phase 11 – Saga + Kafka Integration

## Goal

Kết nối Order, Inventory, Promotion, Payment bằng event-driven Saga.

## Saga happy path

```text
OrderCreated
→ InventoryReserved
→ PromotionReserved
→ FraudChecked
→ PaymentIntentCreated
→ PaymentSucceeded
→ InventoryCommitted
→ PromotionCommitted
→ OrderPaid
→ ShippingCreated
```

## Saga fail path: inventory fail

```text
OrderCreated
→ InventoryReserveFailed
→ OrderCancelled
```

## Saga fail path: promotion fail

```text
OrderCreated
→ InventoryReserved
→ PromotionReserveFailed
→ InventoryReleased
→ OrderCancelled
```

## Saga fail path: payment fail

```text
OrderCreated
→ InventoryReserved
→ PromotionReserved
→ PaymentFailed
→ InventoryReleased
→ PromotionReleased
→ OrderCancelled
```

## Kafka topics

```text
order.events
inventory.events
promotion.events
payment.events
shipping.events
notification.events
audit.events
fraud.events
```

## DLQ topics

```text
order.events.dlq
payment.events.dlq
inventory.events.dlq
```

## Requirements

```text
- Each consumer must be idempotent
- Each event has eventId
- Each event has correlationId
- Retry failed event handling
- Send to DLQ after max retries
```

## Event format

```json
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "correlationId": "uuid",
  "occurredAt": "2026-05-03T00:00:00Z",
  "payload": {}
}
```

---

# 18. Phase 12 – Shipping Service

## Goal

Mô phỏng vận chuyển.

## Features

```text
- Create shipment after payment success
- Update shipment status
- Track order
```

## Tables

```text
shipments
shipment_status_history
```

## APIs

```text
POST /shipping/create
GET  /shipping/:orderId
PATCH /shipping/:id/status
```

## Status

```text
CREATED
READY_TO_PICKUP
PICKED_UP
IN_TRANSIT
DELIVERED
FAILED_DELIVERY
RETURNED
```

## Events

```text
ShippingCreated
ShippingStatusUpdated
OrderDelivered
```

---

# 19. Phase 13 – Notification Service

## Goal

Gửi thông báo realtime và email mock.

## Features

```text
- WebSocket order tracking
- Email mock
- In-app notifications
```

## Events consumed

```text
OrderCreated
PaymentSucceeded
PaymentFailed
ShippingStatusUpdated
RefundSucceeded
SellerApproved
FraudDetected
```

## APIs

```text
GET /notifications/me
POST /notifications/:id/read
```

---

# 20. Phase 14 – Fraud Detection Service

## Goal

Phát hiện hành vi bất thường.

## Features

```text
- Rule-based fraud detection
- Fraud score
- Put high-risk order ON_HOLD
```

## Rules

```text
- User creates more than 5 orders in 1 minute
- More than 3 failed payments in 10 minutes
- Same voucher used by many accounts with same IP
- New account creates high-value order
- Many accounts use same delivery address
```

## Score

```text
0-30 LOW
31-70 MEDIUM
71-100 HIGH
```

## Events

```text
FraudChecked
FraudDetected
OrderOnHold
```

---

# 21. Phase 15 – Audit Log Service

## Goal

Ghi log bất biến cho hành động quan trọng.

## Events consumed

```text
UserLoggedIn
SellerApproved
ProductApproved
OrderCreated
PaymentSucceeded
RefundSucceeded
InventoryReserved
AdminAction
```

## Table

```text
audit_logs
```

## Fields

```text
id
actorId
actorRole
action
resourceType
resourceId
beforeData
afterData
ipAddress
userAgent
correlationId
createdAt
```

## Rules

```text
- Audit log is append-only
- No update/delete endpoint
```

---

# 22. Phase 16 – Search Service

## Goal

Tìm kiếm sản phẩm bằng Elasticsearch.

## Features

```text
- Index active products
- Search by keyword
- Filter by category
- Filter by price
- Sort by rating/sold/price
```

## Events consumed

```text
ProductApproved
ProductUpdated
ProductBanned
ProductDeleted
```

## APIs

```text
GET /search/products?q=&category=&minPrice=&maxPrice=&sort=
```

---

# 23. Phase 17 – API Gateway

## Goal

Tất cả request public đi qua gateway.

## Requirements

```text
- Route service
- Rate limit
- Request body size limit
- CORS
- Correlation ID
- JWT validation optional at gateway
```

## Routes

```text
/auth/*        → auth-service
/users/*       → user-service
/sellers/*     → seller-service
/products/*    → product-service
/cart/*        → cart-service
/orders/*      → order-service
/payments/*    → payment-service
/search/*      → search-service
```

---

# 24. Phase 18 – Docker Compose

## Goal

Chạy toàn bộ local/demo server bằng một lệnh.

## Services required

```text
postgres
redis
kafka
zookeeper hoặc kraft kafka
elasticsearch
kibana
api-gateway
auth-service
product-service
cart-service
order-service
inventory-service
promotion-service
payment-service
```

## Command expected

```bash
docker compose up -d
```

---

# 25. Phase 19 – CI/CD VPS Sync

## Goal

Tự động đồng bộ code và deploy lên VPS/EC2 demo bằng SSH + Docker Compose.

## Target deployment

```text
1 EC2/VPS
Docker Compose
Postgres + Redis + Kafka + backend services
```

## Requirements

```text
- Không đưa SSH host/private key vào .env của app
- Không commit file .pem
- Dùng CI/CD secrets cho SSH_PRIVATE_KEY, SSH_HOST, SSH_USER
- Server giữ file .env production riêng
- Code chỉ đọc DATABASE_URL, REDIS_URL, KAFKA_BROKERS từ env
- Không hardcode localhost/postgres/redis/kafka trong source code
```

## Recommended workflow

```text
Push main branch
→ CI install dependencies
→ Run lint/build/test
→ SSH vào VPS/EC2
→ Pull latest code hoặc rsync artifact
→ docker compose pull/build
→ docker compose up -d
→ docker compose ps
→ Health check services
```

## GitHub Actions secrets

```text
VPS_HOST
VPS_USER
VPS_SSH_PRIVATE_KEY
VPS_APP_DIR
```

## Output expected

```text
.github/workflows/deploy-vps.yml
Script deploy không chứa secret hardcoded
README có hướng dẫn cấu hình secrets
```

---

# 26. Phase 20 – Testing

## Unit tests

```text
- Auth login
- Inventory reserve
- Voucher validate
- Payment idempotency
```

## Integration tests

```text
- Checkout happy path
- Payment failed path
- Inventory insufficient path
- Promotion invalid path
```

## Load test

```text
- Simulate 100 concurrent checkout requests
- Verify no overselling
```

---

# 27. Phase 21 – README + Portfolio

## README must include

```text
- Project overview
- Architecture diagram
- Tech stack
- Features
- How to run
- Demo flow
- API examples
- System design decisions
- Failure handling
```

## CV bullet output

```text
Built an enterprise-grade e-commerce and payment platform using NestJS microservices, Kafka, Redis, PostgreSQL, and Elasticsearch.

Implemented Saga orchestration, Outbox Pattern, payment idempotency, inventory reservation, RBAC, 2FA, fraud detection, and audit logging.
```

---

# 28. Prompt template for AI

Use this prompt for each phase:

```text
You are a senior backend engineer.

Read these files first:
- docs/system_overview.md
- docs/business_logic.md
- docs/deployment_architecture.md
- docs/ai_implementation_steps.md

Now implement Phase [NUMBER]: [PHASE NAME].

Requirements:
- Follow the project structure exactly.
- Do not implement unrelated phases.
- Use NestJS + Prisma + PostgreSQL.
- Add DTO validation.
- Add proper error handling.
- Add logging with correlationId.
- Follow security rules from the docs.
- Add minimal tests for the implemented feature.
- Explain what files you created and how to run/test them.
```

---

# 29. Important instruction for AI

Do not skip these:

```text
- Never trust client amount in payment.
- Never allow seller to edit another seller's product.
- Never allow customer to view another customer’s order.
- Never update inventory without concurrency protection.
- Never process payment without idempotency key.
- Never publish Kafka event without outbox for critical business events.
- Never delete audit logs.
```

---
