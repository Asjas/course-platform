FROM node:22.19.0-alpine3.22

RUN apk --no-cache add curl bash

# Install Python and build dependencies for libpq
RUN apk add --no-cache python3 py3-pip make g++ postgresql-dev

# Set Python path for node-gyp
ENV PYTHON=/usr/bin/python3

EXPOSE 3000

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run build

CMD ["./node_modules/.bin/tsx", "dist/index.js"]
