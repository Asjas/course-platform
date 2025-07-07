FROM node:22.17.0

EXPOSE 3000

RUN mkdir /app
WORKDIR /app

COPY . .
RUN pnpm i

RUN pnpm run build

CMD ["tsx", "dist/index.js"]
