FROM node:22.17.0-alpine3.22

RUN apk --no-cache add curl bash

EXPOSE 3000

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i
RUN pnpm run build

CMD ["./node_modules/.bin/tsx", "dist/index.js"]
