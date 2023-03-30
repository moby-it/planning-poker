
FROM node:18.12.0-slim

WORKDIR /app

RUN npm i -g pnpm@8.0.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

VOLUME [ "/app/src" ]

COPY . .

EXPOSE 3000

CMD exec npm run dev -- --host --port 3000