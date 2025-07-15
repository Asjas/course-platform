# Build custom Caddy with plugins
FROM caddy:2.10.0-builder-alpine AS caddy-builder

RUN apk add --no-cache brotli-dev gcc musl-dev

RUN CGO_ENABLED=1 xcaddy build \
    --with github.com/mholt/caddy-ratelimit \
    --with github.com/dunglas/caddy-cbrotli

# Build Vite application
FROM node:22.17.0-alpine3.22 AS vite-builder

RUN apk add --no-cache gzip brotli zstd fd

WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run -filter "./apps/web" build
RUN fd --type f --size +1400b --regex '\.(html|css|js|json|svg)$' --exec bash -c 'brotli --best "$1" && gzip --best -k "$1" && zstd --ultra -22 -k "$1"' _ {} \;

# Final image with Caddy and built assets
FROM caddy:2.10.0-alpine

RUN apk add --no-cache curl bash

COPY --from=caddy-builder /usr/bin/caddy /usr/bin/caddy
COPY --from=vite-builder /app/apps/web/dist/ /srv/app
COPY --from=vite-builder /app/apps/web/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
