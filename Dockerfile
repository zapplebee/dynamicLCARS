FROM node:24-bookworm-slim AS bun-base

ENV BUN_INSTALL=/root/.bun
ENV PATH=${BUN_INSTALL}/bin:${PATH}

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL https://bun.sh/install | bash

WORKDIR /app

FROM bun-base AS deps

COPY package.json bun.lock tsconfig.json vite.config.ts ./
RUN bun install --frozen-lockfile

FROM deps AS build

COPY css ./css
COPY index.html ./index.html
COPY src ./src
COPY server ./server
RUN bun run build

FROM bun-base AS prod-deps

COPY package.json bun.lock tsconfig.json vite.config.ts ./
RUN bun install --frozen-lockfile --production

FROM node:24-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssh-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production
ENV LCARS_HTTP_PORT=1701

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY package.json ./package.json

EXPOSE 1701

CMD ["node", "dist-server/index.js"]
