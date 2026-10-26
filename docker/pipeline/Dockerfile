ARG MOTIS_IMAGE
FROM ${MOTIS_IMAGE} AS motis

FROM node:24.22.0-alpine3.23
COPY --from=motis /motis /usr/local/bin/motis
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
# Starts as root only to own the data volume, whoever created it, then runs as node.
CMD ["sh", "-c", "chown node:node /data && exec su node -s /bin/sh -c 'node src/pipeline/run.ts'"]
