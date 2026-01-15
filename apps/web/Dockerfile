FROM node:24.13.0-alpine3.22 AS vite-builder

RUN apk --no-cache add curl bash

ARG VITE_BETTER_AUTH_URL
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

WORKDIR /app
COPY --chown=node:node . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run build

FROM nginx:1.29.3-alpine3.22

RUN apk --no-cache add curl bash

# Fix cache directories
RUN mkdir -p /var/cache/nginx/{client_temp,proxy_temp,fastcgi_temp,uwsgi_temp,scgi_temp} \
    && chown -R nginx:nginx /var/cache/nginx \
    && chmod -R 700 /var/cache/nginx

# Fix log directory
RUN mkdir -p /var/log/nginx \
    && chown nginx:nginx /var/log/nginx \
    && chmod 755 /var/log/nginx

# Fix pid directory
RUN mkdir -p /run/nginx && chown nginx:nginx /run/nginx

COPY --from=vite-builder /app/apps/web/dist/ /srv/app
COPY --from=vite-builder /app/apps/web/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]
