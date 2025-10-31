FROM node:24.11.0-alpine3.22 AS vite-builder

ARG VITE_BETTER_AUTH_URL
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web ./apps/web
COPY packages/schema ./packages/schema

RUN npm i -g pnpm@9.15.9
RUN pnpm i --frozen-lockfile --filter "./apps/web" --filter "./packages/schema"
RUN pnpm run build --filter "./apps/web"

FROM nginx:1.29.3-alpine3.22

RUN apk --no-cache add curl bash

COPY --from=vite-builder /app/apps/web/dist/ /srv/app
COPY --from=vite-builder /app/apps/web/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
