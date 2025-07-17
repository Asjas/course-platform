FROM alpine:3.22 AS nginx-builder

ARG NGINX_VERSION=1.29.0
RUN apk add --no-cache build-base git pcre-dev zlib-dev openssl-dev linux-headers
RUN wget https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && tar -zxvf nginx-${NGINX_VERSION}.tar.gz
RUN git clone --recurse-submodules https://github.com/google/ngx_brotli.git
WORKDIR /nginx-${NGINX_VERSION}
RUN ./configure --with-http_gzip_static_module --add-module=/ngx_brotli --prefix=/opt/nginx RUN make && make install

FROM node:22.17.1-alpine3.22 AS vite-builder

RUN apk add --no-cache bash fd gzip brotli zstd

WORKDIR /app
COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run -filter "./apps/web" build
RUN fd --type f --size +1400b --regex '.(html|css|js|json|svg)$' --exec bash -c 'brotli --best "$1" && gzip --best -k "$1" && zstd --ultra -22 -k "$1"' _ {} ;

FROM alpine:3.22

RUN apk add --no-cache pcre zlib openssl curl bash

COPY --from=nginx-builder /opt/nginx /opt/nginx
COPY --from=vite-builder /app/apps/web/dist/ /srv/app
COPY --from=vite-builder /app/apps/web/config/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/log/nginx

EXPOSE 80

CMD ["/opt/nginx/sbin/nginx", "-g", "daemon off;"]
