# ---------- build stage ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
# Serve the ES2017-transformed swagger-ui bundles: the runtime install has no
# esbuild to run scripts/transform-swagger-ui.js, so copy the transformed files
# from the build stage (where postinstall already ran the transform).
COPY --from=build /app/node_modules/swagger-ui-dist/ ./node_modules/swagger-ui-dist/

USER node
EXPOSE 9000
CMD ["node", "dist/main.js"]
