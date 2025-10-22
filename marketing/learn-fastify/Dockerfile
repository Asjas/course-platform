FROM node:22.21.0-alpine3.22 AS vite-builder

RUN apk --no-cache add curl bash

WORKDIR /app
COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i --filter "./marketing/learn-fastify"
RUN pnpm run -filter "./marketing/learn-fastify" build

FROM nginx:1.29.2-alpine3.22

RUN apk --no-cache add curl bash

COPY --from=vite-builder /app/marketing/learn-fastify/dist/ /srv/app
COPY --from=vite-builder /app/marketing/learn-fastify/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
