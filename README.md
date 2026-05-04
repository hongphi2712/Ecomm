# FinCommerce Platform

Enterprise e-commerce and payment simulation platform built with a microservice architecture.

## Current Status

Completed locally:

- Shared common library
- Auth Service with register, login, refresh token, logout, OTP, RBAC guard support, login history, account lock, Swagger, and Docker deploy
- User Service with current profile APIs, profile update, address CRUD, Swagger, and Docker deploy
- Seller Service with seller applications, seller profile, admin review/suspend, Swagger, and Docker deploy
- PostgreSQL Docker Compose deployment
- GitHub Actions deploy flow to EC2/VPS

## Planned Stack

- Node.js
- NestJS
- npm workspaces
- PostgreSQL
- Prisma
- Redis
- Kafka
- Elasticsearch
- Docker Compose

## Structure

```text
fincommerce/
|-- docs/
|-- services/
|   |-- auth-service/
|   |-- user-service/
|   `-- seller-service/
|-- libs/
|-- gateway/
|-- infrastructure/
|-- .env
|-- .env.example
|-- docker-compose.yml
|-- package.json
`-- README.md
```

## Development

Implementation must follow `docs/ai_implementation_steps.md` phase by phase.

```bash
npm run build
npm test
docker compose up -d --build postgres auth-service user-service seller-service
```

Seller Service phase checklist:

```text
POST /sellers/apply
GET  /sellers/me
GET  /admin/sellers/pending
POST /admin/sellers/:id/approve
POST /admin/sellers/:id/reject
POST /admin/sellers/:id/suspend
```

## Service URLs

Local:

```text
Auth Service: http://localhost:3001
User Service: http://localhost:3002
Seller Service: http://localhost:3003
```

EC2 currently used for testing:

```text
Auth Service: http://ec2-13-212-242-156.ap-southeast-1.compute.amazonaws.com:3001
User Service: http://ec2-13-212-242-156.ap-southeast-1.compute.amazonaws.com:3002
Seller Service: http://ec2-13-212-242-156.ap-southeast-1.compute.amazonaws.com:3003
```
