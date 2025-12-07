FROM node:24.11.0-alpine3.22 AS vite-builder

RUN apk --no-cache add curl bash

ARG VITE_BETTER_AUTH_URL
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL

WORKDIR /app
COPY --chown=node:node . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run build

FROM nginx:1.29.3-alpine3.22

RUN apk --no-cache add curl bash

COPY --from=vite-builder /app/apps/web/dist/ /srv/app
COPY --from=vite-builder /app/apps/web/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]
