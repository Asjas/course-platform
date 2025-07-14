# Build Vite application
FROM node:22.17.0-alpine3.22 AS vite-builder

RUN apk add --no-cache curl bash

WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run -filter "./apps/web" build

WORKDIR /app/apps/web

EXPOSE 8080

CMD ["npm", "run", "serve"]
