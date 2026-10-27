# ---------- build stage ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
# postinstall runs scripts/transform-swagger-ui.js, so it must exist before npm ci
COPY scripts ./scripts
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
# postinstall still runs here; without esbuild it exits cleanly (skip message)
COPY scripts ./scripts
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
# Serve the ES2017-transformed swagger-ui bundles: the runtime install has no
# esbuild to run scripts/transform-swagger-ui.js, so copy the transformed files
# from the build stage (where postinstall already ran the transform), plus the
# @nestjs/swagger HTML template the script patches with the boot diagnostic.
COPY --from=build /app/node_modules/swagger-ui-dist/ ./node_modules/swagger-ui-dist/
COPY --from=build /app/node_modules/@nestjs/swagger/dist/swagger-ui/constants.js ./node_modules/@nestjs/swagger/dist/swagger-ui/constants.js

RUN mkdir -p /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 9000
CMD ["node", "dist/main.js"]
