FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY libs/common/package.json libs/common/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY tsconfig.base.json ./
COPY libs/common libs/common
COPY services/auth-service services/auth-service

RUN npm run prisma:generate -w auth-service
RUN npm run build -w @fincommerce/common
RUN npm run build -w auth-service

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY libs/common/package.json libs/common/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm ci --omit=dev

COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY --from=build /app/node_modules/@prisma node_modules/@prisma
COPY --from=build /app/libs/common/dist libs/common/dist
COPY --from=build /app/services/auth-service/dist services/auth-service/dist
COPY --from=build /app/services/auth-service/prisma services/auth-service/prisma

EXPOSE 3001

CMD ["sh", "-c", "npm run prisma:push -w auth-service && npm run start -w auth-service"]
