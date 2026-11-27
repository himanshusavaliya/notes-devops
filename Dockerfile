FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build
FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist ./public
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
ENV PORT=3000
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.js"]