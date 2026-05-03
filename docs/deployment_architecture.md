# 🚀 FinCommerce Platform

### Deployment & Infrastructure Architecture

---

# 🎯 1. Mục tiêu deployment

Hệ thống được thiết kế để:

* Dễ deploy (local → staging → production)
* Scale từng service độc lập
* Đảm bảo reliability (retry, failover)
* Monitoring đầy đủ
* Phù hợp kiến trúc enterprise

---

# 🏗️ 2. Tổng quan hạ tầng

## 2.1 High-level deployment

```id="dep1"
Internet
   ↓
Load Balancer (Nginx / Cloudflare)
   ↓
API Gateway (Kong / Nginx)
   ↓
-------------------------------
| Microservices Cluster       |
|-----------------------------|
| Auth Service                |
| Product Service             |
| Order Service               |
| Payment Service             |
| Inventory Service           |
| ...                         |
-------------------------------
   ↓
-------------------------------
| Data Layer                  |
|-----------------------------|
| PostgreSQL                 |
| Redis                      |
| Kafka                      |
| Elasticsearch              |
-------------------------------
   ↓
Monitoring & Logging (ELK / Grafana)
```

---

# ⚙️ 3. Môi trường triển khai

## 3.1 Local (development)

```text
- Docker Compose
- 1 instance mỗi service
- Mock payment
- Kafka single node
```

---

## 3.2 Staging

```text
- Giống production (nhưng scale nhỏ)
- Test load
- Test failure
```

---

## 3.3 Production

```text
- Multi-instance services
- Load balancing
- Backup database
- Monitoring đầy đủ
```

---

# 🐳 4. Docker architecture

## 4.1 Service container

Mỗi service có:

```text
- Dockerfile
- .env config
- Health check endpoint
```

---

## 4.2 Docker Compose (local)

```yaml id="dep2"
version: "3.9"

services:
  api-gateway:
    image: nginx
    ports:
      - "80:80"

  auth-service:
    build: ./services/auth-service

  product-service:
    build: ./services/product-service

  order-service:
    build: ./services/order-service

  postgres:
    image: postgres:15

  redis:
    image: redis:7

  kafka:
    image: bitnami/kafka
```

---

# 🔁 5. Service communication

## 5.1 Sync (REST)

```text
- API Gateway → Services
- Service → Service (nếu cần)
```

---

## 5.2 Async (Kafka)

```text
OrderCreated
→ Inventory Service
→ Promotion Service
→ Fraud Service
→ Payment Service
```

---

# 📦 6. Database deployment

## 6.1 PostgreSQL

```text
- Primary DB
- Backup định kỳ
- Connection pool (pgbouncer)
```

---

## 6.2 Redis

```text
- Cache
- Distributed lock
- Session store
```

---

## 6.3 Kafka

```text
- Event streaming
- Topic-based communication
- Retry + DLQ
```

---

## 6.4 Elasticsearch

```text
- Search product
- Log indexing
```

---

# 🔐 7. Security deployment

## 7.1 API Gateway protection

```text
- Rate limiting
- IP filtering
- JWT validation
```

---

## 7.2 Network security

```text
- Internal services không expose public
- Chỉ gateway public
```

---

## 7.3 Secret management

```text
- ENV variables
- Không hardcode secret
```

---

# 📊 8. Monitoring & Logging

## 8.1 Logging

```text
- Centralized logging (ELK)
- Log theo correlationId
```

---

## 8.2 Metrics

```text
- API latency
- Error rate
- Kafka lag
- DB connection usage
```

---

## 8.3 Health check

```text
GET /health

Response:
{
  "status": "ok"
}
```

---

# 🔄 9. Scaling strategy

## 9.1 Horizontal scaling

```text
- Scale theo service
- Ví dụ:
  - Order Service x3
  - Payment Service x2
```

---

## 9.2 Stateless services

```text
- Không lưu state trong memory
- Dùng Redis / DB
```

---

## 9.3 Kafka scaling

```text
- Partition topic
- Consumer group
```

---

# ⚠️ 10. Failure handling

## 10.1 Service crash

```text
- Docker restart policy
- Health check
```

---

## 10.2 Kafka failure

```text
- Retry
- Dead Letter Queue
```

---

## 10.3 Database failure

```text
- Backup
- Retry connection
```

---

# 🔁 11. CI/CD (optional nâng cao)

## 11.1 Flow tổng quát

```text
Code push
→ Install dependencies
→ Run lint/build/test
→ SSH vào VPS/EC2
→ Pull latest code hoặc sync artifact
→ docker compose build/pull
→ docker compose up -d
→ Health check
```

---

## 11.2 VPS/EC2 demo deployment

Giai đoạn demo/CV dùng:

```text
1 EC2/VPS
Docker Compose
Postgres + Redis + Kafka + backend services
```

Khi cần scale, migrate từng phần:

```text
Postgres Docker → AWS RDS
Redis Docker → ElastiCache
Kafka Docker → AWS MSK / Confluent Cloud
Backend container → ECS / Kubernetes
```

Code phải luôn đọc infrastructure endpoint từ env:

```text
DATABASE_URL=...
REDIS_URL=...
KAFKA_BROKERS=...
```

Không hardcode trong source code:

```text
localhost:5432
localhost:6379
localhost:9092
```

Trong Docker Compose có thể dùng service DNS:

```text
postgres:5432
redis:6379
kafka:9092
```

Sau này chuyển sang managed service chỉ sửa `.env` production:

```text
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/fincommerce
REDIS_URL=redis://elasticache-endpoint:6379
KAFKA_BROKERS=b-1.msk-endpoint:9092,b-2.msk-endpoint:9092
```

---

## 11.3 CI/CD secrets

Không đưa SSH config vào `.env` của app. Dùng secrets của CI/CD:

```text
VPS_HOST
VPS_USER
VPS_SSH_PRIVATE_KEY
VPS_APP_DIR
```

Private key `.pem` chỉ lưu local hoặc trong CI/CD secret, không commit vào repository.

---

## 11.4 Deploy command trên server

CI/CD sau khi SSH vào server chạy:

```bash
cd "$VPS_APP_DIR"
git pull --ff-only
docker compose build
docker compose up -d
docker compose ps
```

---

# 📦 12. Deployment options

## Option 1 (đơn giản)

```text
- VPS (DigitalOcean, AWS EC2)
- Docker Compose
```

---

## Option 2 (enterprise)

```text
- Kubernetes
- Auto scaling
- Service mesh
```

---

# 🎯 13. Performance targets

```text
- API latency < 200ms
- Event processing < 500ms
- 10k+ orders/day
```

---

# 📌 14. Kết luận

Hệ thống deployment đảm bảo:

* Scalable
* Fault-tolerant
* Secure
* Observable

---

# 🚀 Tổng kết 3 file

```text
system_overview.md        → kiến trúc tổng thể
business_logic.md         → nghiệp vụ chi tiết
deployment_architecture.md → triển khai hệ thống
```

---
