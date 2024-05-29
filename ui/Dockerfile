
FROM node:18.12.0-alpine as build

ARG MODE=production

WORKDIR /app

RUN npm i -g pnpm@9.0.4

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . ./

RUN npm run build -- --mode $MODE

FROM nginx:1.23-alpine

LABEL org.opencontainers.image.source=https://github.com/moby-it/planning-poker

COPY --from=build /app/dist/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
