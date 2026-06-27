FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_OCTOPUS_TRACK_LOGIN_URL
ARG VITE_OCTOPUS_FLOW_LOGIN_URL
ARG VITE_LANDING_CHECKOUT_URL
ARG VITE_LANDING_MP_CHECKOUT_WEBHOOK_URL
ARG VITE_LANDING_ASSET_WEBHOOK_URL
ARG VITE_VISITOR_WEBHOOK_URL
ARG APP_VERSION

ENV VITE_OCTOPUS_TRACK_LOGIN_URL=${VITE_OCTOPUS_TRACK_LOGIN_URL:-https://app.octopustrack.shop}
ENV VITE_OCTOPUS_FLOW_LOGIN_URL=${VITE_OCTOPUS_FLOW_LOGIN_URL:-https://login-flow.octopustrack.shop}
ENV VITE_LANDING_CHECKOUT_URL=${VITE_LANDING_CHECKOUT_URL:-#checkout-no-configured}
ENV VITE_LANDING_MP_CHECKOUT_WEBHOOK_URL=${VITE_LANDING_MP_CHECKOUT_WEBHOOK_URL:-https://n8nw.qeva.xyz/webhook/octopus-mp}
ENV VITE_LANDING_ASSET_WEBHOOK_URL=${VITE_LANDING_ASSET_WEBHOOK_URL:-#webhook-no-configured}
ENV VITE_VISITOR_WEBHOOK_URL=${VITE_VISITOR_WEBHOOK_URL:-#webhook-no-configured}
ENV APP_VERSION=${APP_VERSION:-unknown}

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/landing.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
