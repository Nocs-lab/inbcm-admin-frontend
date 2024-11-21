FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm build

FROM devforth/spa-to-http
ENV BROTLI=true
ENV THRESHOLD=512
COPY --from=build /usr/src/app/dist .
