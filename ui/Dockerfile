
FROM node:18.12.0-alpine as build
WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . ./

RUN npm run build:prod

FROM nginx:1.23-alpine

COPY --from=build /app/dist/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
