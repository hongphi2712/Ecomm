# 🧠 FinCommerce Platform

### Business Logic Specification (Deep Dive)

---

# 🎯 1. Mục tiêu

Tài liệu này mô tả **nghiệp vụ chi tiết** của hệ thống:

* Checkout flow
* Payment (fintech-level)
* Inventory (consistency)
* Promotion (concurrency)
* Refund (reverse transaction)
* Fraud detection
* Audit logging

---

# 🔐 2. Authentication & Security

## 2.1 Login Flow

```id="n1o2p3"
User login
→ Validate password
→ Check account locked
→ Generate access token (15m)
→ Generate refresh token (7d)
→ Store refresh token (hashed)
```

---

## 2.2 Refresh Token Rotation

```id="r1o2t3"
Client gửi refresh token
→ Validate DB
→ Issue new access + refresh token
→ Revoke old refresh token
```

---

## 2.3 RBAC + Ownership

Rules:

* Seller chỉ sửa sản phẩm của mình
* Customer chỉ xem đơn của mình
* Admin có toàn quyền

---

## 2.4 2FA Flow

```id="o2t3p4"
Login success
→ Nếu role = ADMIN/SELLER
→ yêu cầu OTP
→ verify OTP
→ cấp token
```

---

# 🛍️ 3. Product & Seller

## 3.1 Seller Onboarding

```id="s1l2r3"
User apply seller
→ status = PENDING
→ Admin review
→ APPROVED / REJECTED
```

---

## 3.2 Product Lifecycle

```id="p1r2d3"
DRAFT
→ PENDING_APPROVAL
→ ACTIVE
→ BANNED
```

---

## 3.3 Rules

* Seller bị suspend → disable product
* Product bị report → chuyển review

---

# 🛒 4. Cart Service

## 4.1 Flow

```id="c1a2r3"
Add item
→ check product ACTIVE
→ check stock
→ store Redis
```

---

## 4.2 Data Model

```json id="c4a5r6"
{
  "productId": "P1",
  "variantId": "V1",
  "priceSnapshot": 100,
  "quantity": 2
}
```

---

## 4.3 Edge Cases

* Giá thay đổi → update snapshot
* Product hết hàng → remove

---

# 🔥 5. Checkout (Order Orchestration)

## 5.1 Flow

```id="o1r2d3"
Validate cart
→ Snapshot price
→ Calculate total
→ Create order (PENDING)
→ Emit OrderCreated
```

---

## 5.2 Order Schema

```json id="o4r5d6"
{
  "orderId": "ORD_123",
  "customerId": "U1",
  "items": [],
  "subtotal": 1000,
  "discount": 100,
  "total": 900,
  "status": "PENDING"
}
```

---

## 5.3 Edge Cases

* Product bị ban
* Inventory thiếu
* Voucher invalid

---

# 📦 6. Inventory Service

## 6.1 Stock Model

```id="i1n2v3"
available
reserved
sold
```

---

## 6.2 Flow

```id="i4n5v6"
OrderCreated
→ reserve stock
→ Payment success → commit
→ Payment fail → release
```

---

## 6.3 Concurrency

### Redis Lock

```id="i7n8v9"
lock:inventory:variant_id
```

---

### Optimistic Lock

```sql id="i10n11v12"
UPDATE inventory
SET available = available - 2
WHERE available >= 2
```

---

## 6.4 Timeout

* Reservation hết hạn sau 15 phút

---

# 🎟️ 7. Promotion Service

## 7.1 Flow

```id="p1r2m3"
Apply voucher
→ validate
→ reserve usage
→ commit/release
```

---

## 7.2 Data

```id="p4r5m6"
limit = 100
used = 80
reserved = 10
```

---

## 7.3 Rules

* 1 user dùng 1 lần
* Có thời gian hiệu lực
* Có min order

---

# 💳 8. Payment Service

## 8.1 Flow

```id="p7a8y9"
Create payment intent
→ User pay
→ SUCCESS / FAILED
```

---

## 8.2 Idempotency

```id="p10a11y12"
POST /pay
Idempotency-Key = abc123
```

---

## 8.3 Payment States

```id="p13a14y15"
INITIATED
PROCESSING
SUCCESS
FAILED
```

---

## 8.4 Edge Cases

* Retry payment
* Timeout
* Double charge

---

# 🚚 9. Shipping Service

## 9.1 Flow

```id="s1h2i3"
Payment success
→ create shipment
→ tracking
```

---

## 9.2 Status

```id="s4h5i6"
CREATED
IN_TRANSIT
DELIVERED
```

---

# 🔁 10. Refund

## 10.1 Flow

```id="r1e2f3"
Refund request
→ validate
→ payment refund
→ update order
```

---

## 10.2 Rules

* Order đã PAID
* Chưa REFUNDED

---

## 10.3 Edge Cases

* Double refund
* Partial refund

---

# 🕵️ 11. Fraud Detection

## 11.1 Rules

```id="f1r2a3"
- nhiều order nhanh
- nhiều payment fail
- voucher abuse
```

---

## 11.2 Flow

```id="f4r5a6"
OrderCreated
→ calculate score
→ HIGH → ON_HOLD
```

---

# 📜 12. Audit Log

## 12.1 Events

```id="a1u2d3"
UserLogin
OrderCreated
PaymentSuccess
Refund
AdminAction
```

---

## 12.2 Data

```id="a4u5d6"
actorId
action
resource
before
after
timestamp
correlationId
```

---

# 🔁 13. Saga Flow

## 13.1 Happy Path

```id="s1a2g3"
OrderCreated
→ InventoryReserved
→ PromotionReserved
→ PaymentSuccess
→ InventoryCommit
→ PromotionCommit
→ ShippingCreate
```

---

## 13.2 Fail Path

```id="s4a5g6"
PaymentFailed
→ InventoryRelease
→ PromotionRelease
→ OrderCancel
```

---

# 🎯 14. System Guarantees

* No overselling
* No duplicate payment
* Eventual consistency
* Retry-safe operations

---

# 📌 Kết luận

Hệ thống đảm bảo:

* Distributed system correctness
* Fintech-grade payment flow
* Secure backend design
* Real-world business logic

---
