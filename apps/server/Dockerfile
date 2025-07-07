FROM node:22.17.0

EXPOSE 3000

RUN mkdir /app
WORKDIR /app

COPY . .
RUN npm i -g pnpm@9.15.9
RUN pnpm i

RUN pnpm run build
RUN ln -s /app/node_modules/.bin/tsx /app/tsx

CMD ["tsx", "dist/index.js"]
