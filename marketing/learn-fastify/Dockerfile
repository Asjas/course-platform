FROM node:22.19.0-alpine3.22 AS vite-builder

RUN apk --no-cache add curl bash python3 py3-pip make g++ postgresql-dev

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

WORKDIR /app
COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run build

FROM nginx:1.29.1-alpine3.22

RUN apk --no-cache add curl bash

COPY --from=vite-builder /app/apps/web/dist/ /srv/app
COPY --from=vite-builder /app/apps/web/config/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
