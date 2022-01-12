FROM node:16.10.0-alpine AS base

WORKDIR /usr/app/bot-bannis

COPY . .

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

RUN chown -R node:node /usr/app/bot-bannis

RUN npm install

RUN npm run build

USER node

EXPOSE 5000

FROM base as production

ENV NODE_ENV=production

CMD ["npm", "start"]

FROM base as dev

ENV NODE_ENV=dev

CMD ["npm", "run", "dev"]
