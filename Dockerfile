FROM node:16.10.0-alpine AS base

WORKDIR /usr/app/bot-bannis

COPY --chown=node:node . .

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

RUN npm install

RUN npm run build

USER node

EXPOSE 5000

FROM base as production

ENV NODE_ENV=production

CMD ["npm", "start"]

FROM base as development

ENV NODE_ENV=dev

CMD ["npm", "run", "dev"]
