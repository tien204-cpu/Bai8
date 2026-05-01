FROM node:18-alpine
RUN apk add --no-cache openssl
RUN npm i -g pnpm@8 @nestjs/cli
WORKDIR /app
COPY . .
RUN pnpm install
EXPOSE 3005
CMD ["sh", "-c", "cd apps/notification-service && npx ts-node -r tsconfig-paths/register src/main.ts"]
