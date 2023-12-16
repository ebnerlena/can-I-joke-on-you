FROM node:21.0.0-bullseye-slim as base
ENV PORT 3000
EXPOSE $PORT
USER node
WORKDIR /app

## BUILDER IMAGE

FROM base AS builder
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --chown=node:node package*.json ./
RUN npm ci && npm cache clean --force && npm prune --omit=peer

COPY --chown=node:node ./ ./
RUN npm run build
CMD ["node", ".next/standalone/server.js"]

## PRODUCTION CI IMAGE

FROM base AS prod

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# runtime environment variable substitution
COPY --chown=node:node .env .
COPY --chown=node:node entrypoint.sh  /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
CMD ["node", "server.js"]
