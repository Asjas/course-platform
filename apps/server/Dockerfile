FROM node:24.11.0-alpine3.22 AS builder

RUN apk --no-cache add python3 py3-pip make g++ postgresql-dev postgresql-client

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

WORKDIR /app

COPY .npmrc ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tooling/tsconfig /tooling/tsconfig
COPY packages/db packages/db
COPY packages/schema packages/schema
COPY apps/server apps/server

RUN npm i -g pnpm@10.20.0
RUN pnpm i --frozen-lockfile
RUN pnpm run build:server
RUN pnpm deploy --filter @apps/server --prod /prod/server

FROM node:24.11.0-alpine3.22

RUN apk --no-cache add bash curl dumb-init

EXPOSE 3000

WORKDIR /app

COPY --from=builder /prod/server ./

RUN npm i -g pnpm@10.20.0
RUN pnpm i --prod --frozen-lockfile
RUN pnpm prune --prod

# Run migration inside @packages/db
RUN pnpm --filter @packages/db run drizzle:migrate
RUN psql $DATABASE_URL -f apps/server/scripts/createDefaultDatabaseUsers.sql

ENTRYPOINT ["dumb-init"]
CMD ["node", "--max-semi-space-size=512", "--max-old-space-size=15400", "dist/index.js"]
