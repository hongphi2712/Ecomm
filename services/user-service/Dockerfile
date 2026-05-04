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
COPY services/user-service services/user-service

RUN npm run prisma:generate -w user-service
RUN npm run build -w @fincommerce/common
RUN npm run build -w user-service

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
COPY --from=build /app/services/user-service/dist services/user-service/dist
COPY --from=build /app/services/user-service/generated services/user-service/generated
COPY --from=build /app/services/user-service/prisma services/user-service/prisma

EXPOSE 3002

CMD ["sh", "-c", "npm run prisma:push -w user-service && npm run start -w user-service"]
