FROM node:24.9.0-alpine3.22

RUN apk --no-cache add bash curl dumb-init python3 py3-pip make g++ postgresql-dev postgresql-client

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

EXPOSE 3000

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run build
RUN npm run drizzle:migrate:prod

RUN psql $DATABASE_URL -f /app/scripts/createDefaultDatabaseUsers.sql

ENTRYPOINT ["dumb-init"]
CMD ["node", "--max-semi-space-size=512", "--max-old-space-size=15400", "dist/index.js"]
