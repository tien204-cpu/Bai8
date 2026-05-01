FROM node:18-alpine
RUN apk add --no-cache openssl
RUN npm i -g pnpm@8 @nestjs/cli
WORKDIR /app
COPY . .
RUN pnpm install
EXPOSE 3000
CMD ["sh", "-c", "cd apps/api-gateway && npx ts-node -r tsconfig-paths/register src/main.ts"]
