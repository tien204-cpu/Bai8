FROM node:18-alpine
RUN apk add --no-cache openssl
RUN npm i -g pnpm@8 @nestjs/cli
WORKDIR /app
COPY . .
RUN pnpm install
RUN cd apps/order-service && npx prisma generate
EXPOSE 3003
CMD ["sh", "-c", "cd apps/order-service && npx prisma db push && npx ts-node -r tsconfig-paths/register src/main.ts"]
