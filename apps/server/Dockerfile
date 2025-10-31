FROM node:24.11.0-alpine3.22 AS builder

RUN apk --no-cache add python3 py3-pip make g++ postgresql-dev postgresql-client

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

RUN mkdir /app
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/server ./apps/server
COPY packages/schema ./packages/schema

RUN npm i -g pnpm@9.15.9
RUN pnpm i --frozen-lockfile --filter "./apps/server" --filter "./packages/schema"
RUN pnpm run build --filter "./apps/server"
RUN pnpm run drizzle:migrate:prod --filter "./apps/server"
RUN psql $DATABASE_URL -f apps/server/scripts/createDefaultDatabaseUsers.sql

FROM node:24.11.0-alpine3.22

RUN mkdir /app
RUN apk --no-cache add bash curl dumb-init

EXPOSE 3000

COPY --from=builder /app/apps/server/dist/ /app

WORKDIR /app/apps/server

ENTRYPOINT ["dumb-init"]
CMD ["node", "--max-semi-space-size=512", "--max-old-space-size=15400", "dist/index.js"]
