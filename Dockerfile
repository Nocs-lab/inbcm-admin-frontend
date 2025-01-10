FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ARG VITE_SHORT_SHA

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm build

FROM devforth/spa-to-http
ENV BROTLI=true
ENV THRESHOLD=512
ENV VITE_SHORT_SHA=${VITE_SHORT_SHA}
COPY --from=build /usr/src/app/dist .
