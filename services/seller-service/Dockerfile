FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY libs/common/package.json libs/common/package.json
COPY services/auth-service/package.json services/auth-service/package.json
COPY services/user-service/package.json services/user-service/package.json
COPY services/seller-service/package.json services/seller-service/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY tsconfig.base.json ./
COPY libs/common libs/common
COPY services/seller-service services/seller-service

RUN npm run prisma:generate -w @fincommerce/seller-service
RUN npm run build -w @fincommerce/common
RUN npm run build -w @fincommerce/seller-service

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY libs/common/package.json libs/common/package.json
COPY services/auth-service/package.json services/auth-service/package.json
COPY services/user-service/package.json services/user-service/package.json
COPY services/seller-service/package.json services/seller-service/package.json
RUN npm ci --omit=dev

COPY --from=build /app/libs/common/dist libs/common/dist
COPY --from=build /app/services/seller-service/dist services/seller-service/dist
COPY --from=build /app/services/seller-service/generated services/seller-service/generated
COPY --from=build /app/services/seller-service/prisma services/seller-service/prisma

EXPOSE 3003

CMD ["sh", "-c", "npm run prisma:push -w @fincommerce/seller-service && npm run start -w @fincommerce/seller-service"]
