FROM node:lts-alpine AS base

FROM base AS deps
WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm ci

# rebuild source
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node package.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules

COPY --chown=node:node --from=build /app/build ./build

COPY --chown=node:node docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# allow node to write in workdir
RUN chown node:node /app

USER node
ENTRYPOINT [ "./docker-entrypoint.sh" ]