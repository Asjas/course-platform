FROM node:22.17.0-alpine3.22 AS builder

RUN apk --no-cache add curl bash

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN cd apps/web/
RUN pnpm i
RUN pnpm run build

FROM caddy:2.10.0-alpine

COPY --from=builder /app/apps/web/dist /srv

EXPOSE 443

CMD ["caddy", "start"]
