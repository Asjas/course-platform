FROM node:22.20.0-alpine3.22

RUN apk --no-cache add curl bash python3 py3-pip make g++ postgresql-dev postgresql-client

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

EXPOSE 3000

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run build

RUN ["npm", "run", "drizzle:migrate"]

RUN psql $DATABASE_URL -f /app/scripts/createDefaultDatabaseUsers.sql

ENV NODE_ENV=production

CMD ["./node_modules/.bin/tsx", "dist/index.js"]
