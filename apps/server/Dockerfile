FROM node:24.11.0-alpine3.22 AS builder

RUN apk --no-cache add bash curl dumb-init python3 py3-pip make g++ postgresql-dev postgresql-client

EXPOSE 3000

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

WORKDIR /app

COPY .npmrc ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tooling/tsconfig tooling/tsconfig
COPY packages/db packages/db
COPY packages/schema packages/schema
COPY apps/server apps/server

RUN npm i -g pnpm@10.20.0
RUN pnpm i --frozen-lockfile

RUN pnpm --filter @packages/db run drizzle:migrate:prod
RUN psql $DATABASE_URL -f apps/server/scripts/createDefaultDatabaseUsers.sql

ENTRYPOINT ["dumb-init"]
CMD ["node", "--max-semi-space-size=512", "--max-old-space-size-percentage=90", "--permission", "--allow-fs-read=/app", "--allow-net", "--allow-addons", "dist/index.js"]
