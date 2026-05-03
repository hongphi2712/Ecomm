# 🏦 FinCommerce Platform

### Enterprise E-commerce & Payment System (Event-driven Architecture)

---

# 🎯 1. Mục tiêu dự án

Xây dựng một hệ thống thương mại điện tử ở cấp độ **enterprise**, mô phỏng các nền tảng như:

* Shopee / Lazada / Tiki
* Kết hợp hệ thống thanh toán kiểu MB / ViettelPay

Hệ thống tập trung vào:

* Microservices architecture
* Event-driven system (Kafka)
* Distributed transaction (Saga)
* Security (RBAC, JWT, 2FA)
* Reliability (idempotency, retry, outbox)
* Observability (logging, monitoring)

---

# 🧠 2. Phạm vi hệ thống

## 2.1 Actors

* Customer → mua hàng
* Seller → bán hàng
* Admin → quản lý hệ thống
* Support → xử lý sự cố / refund / fraud

---

## 2.2 Chức năng chính

* Authentication & Authorization
* Seller onboarding & management
* Product management
* Cart & checkout
* Order processing
* Payment simulation
* Inventory management
* Promotion & voucher
* Shipping simulation
* Notification (realtime)
* Fraud detection
* Audit logging
* Search & analytics

---

# 🏗️ 3. Kiến trúc tổng thể

## 3.1 High-level architecture

```
Client (Web / Mobile)
        ↓
API Gateway
        ↓
----------------------------
| Auth Service             |
| User Service             |
| Seller Service           |
| Product Service          |
| Cart Service             |
| Order Service            |
| Inventory Service        |
| Promotion Service        |
| Payment Service          |
| Shipping Service         |
| Notification Service     |
| Fraud Detection Service  |
| Audit Log Service        |
| Search Service           |
| Analytics Service        |
----------------------------
        ↓
Kafka (Event Bus)
        ↓
----------------------------
| PostgreSQL              |
| Redis                   |
| Elasticsearch           |
----------------------------
```

---

## 3.2 Nguyên tắc thiết kế

* Microservices độc lập
* Giao tiếp qua REST + Kafka events
* Event-driven architecture
* Eventual consistency
* Stateless service

---

# ⚙️ 4. Tech stack

## Backend

* NodeJS (NestJS)
* PostgreSQL
* Redis
* Kafka
* Elasticsearch

---

## Security

* JWT (Access + Refresh)
* RBAC
* 2FA
* Rate limiting
* Idempotency key

---

## Realtime

* Socket.IO

---

## DevOps

* Docker
* Docker Compose
* API Gateway (Kong / Nginx)

---

# 🔐 5. Security tổng thể

Hệ thống áp dụng nhiều lớp bảo mật:

* Authentication: JWT + refresh token rotation
* Authorization: RBAC + ownership validation
* 2FA: cho admin/seller/support
* API Gateway protection: rate limit, validation
* Idempotency: tránh double payment
* Audit log: ghi lại mọi hành động quan trọng

---

# 🔄 6. Luồng dữ liệu tổng quát

## 6.1 Luồng chính (Checkout)

```
User → Cart → Checkout
→ Order Service tạo order
→ Inventory reserve
→ Promotion reserve
→ Fraud check
→ Payment processing
→ Shipping
→ Notification
→ Complete
```

---

## 6.2 Luồng event-driven

```
OrderCreated
→ InventoryReserved
→ PromotionReserved
→ PaymentIntentCreated
→ PaymentSucceeded
→ OrderPaid
→ ShippingCreated
→ NotificationSent
```

---

# 🔁 7. Transaction model

## 7.1 Saga pattern

```
Step 1: Order created
Step 2: Reserve inventory
Step 3: Reserve voucher
Step 4: Process payment
Step 5: Commit tất cả
```

---

## 7.2 Compensation (rollback)

```
Payment failed
→ Release inventory
→ Release voucher
→ Cancel order
```

---

# 📦 8. Data consistency

* Eventual consistency
* Saga orchestration
* Outbox pattern

---

# 📊 9. Observability

* Centralized logging (ELK)
* Correlation ID theo request
* Metrics:

  * latency
  * error rate
  * throughput
* Health check từng service

---

# ⚠️ 10. Các vấn đề hệ thống cần xử lý

## Concurrency

* Overselling inventory
* Voucher overuse

## Reliability

* Payment retry
* Kafka retry
* Dead letter queue

## Security

* Unauthorized access
* Token theft
* Fraud transactions

## Data integrity

* Duplicate payment
* Missing events
* Inconsistent state

---

# 🎯 11. Mục tiêu kỹ thuật

* Xử lý 10k+ orders/day (simulate)
* Latency < 200ms cho API chính
* Event processing < 500ms
* No overselling
* No duplicate payment

---

# 🧠 12. Giá trị của dự án

Dự án thể hiện:

* System design (microservices)
* Distributed system
* Fintech logic (payment, refund)
* Security engineering
* Event-driven architecture
* Real-world business logic

---

# 📌 13. Phạm vi MVP

## Phase 1

* Auth
* Product
* Cart
* Order
* Inventory
* Payment (mock)

## Phase 2

* Kafka
* Saga
* Outbox
* Redis lock
* Audit log

## Phase 3

* Promotion
* Shipping
* Fraud detection
* Search (Elastic)
* Realtime notification

---

# 📌 Kết luận

Đây là hệ thống:

* Microservices architecture
* Event-driven system
* Fintech-style payment flow
* Enterprise-grade backend

---
