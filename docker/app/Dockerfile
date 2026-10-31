FROM node:24.22.0-alpine3.23 AS base
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 NPM_CONFIG_UPDATE_NOTIFIER=false

# compose.yaml mounts the source, and node_modules in its own volume.
FROM base AS dev
COPY docker/app/dev-entrypoint.sh /usr/local/bin/dev-entrypoint
ENTRYPOINT ["dev-entrypoint"]
CMD ["npm", "run", "dev"]

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM base AS production
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null http://127.0.0.1:4321/health || exit 1
CMD ["node", "dist/server/entry.mjs"]
