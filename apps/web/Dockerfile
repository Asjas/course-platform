FROM node:22.18.0-alpine3.22 AS vite-builder

ARG VITE_BETTER_AUTH_URL
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL

WORKDIR /app
COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run -filter "./apps/web" build

FROM nginx:1.29.1-alpine3.22

COPY --from=vite-builder /app/apps/web/dist/ /srv/app
COPY --from=vite-builder /app/apps/web/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
