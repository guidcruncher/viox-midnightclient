FROM node:24-alpine AS builder
ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /build/src
COPY ./src .
WORKDIR /build/scripts
COPY ./scripts/ .
WORKDIR /build/plugins
COPY ./plugins/* .
WORKDIR /build 
COPY ./*.html .
COPY ./*.ts .
COPY ./knip.json knip.json
COPY ./tsconfig* .
COPY ./vite* .
COPY ./*.js .
COPY ./package.json package.json
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm approve-builds --all
RUN pnpm run build:prod
COPY ./public /build/dist/
COPY ./package.json /build/dist/package.json

# Final runtime image

FROM caddy:latest AS production-stage

RUN mkdir -p /app
COPY --from=builder /build/dist/ /app
WORKDIR /app
# RUN pnpm install

COPY ./docker-items/Caddyfile /etc/caddy/Caddyfile

EXPOSE 8081

