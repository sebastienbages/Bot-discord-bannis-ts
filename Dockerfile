FROM node:16.10.0-alpine AS base

WORKDIR /usr/app/bot-bannis

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build
RUN cp -R Assets/ bin/Assets/

EXPOSE 5000

FROM base as production

ENV NODE_ENV=production

CMD ["npm", "start"]

FROM base as dev

ENV NODE_ENV=dev

CMD ["npm", "run", "dev"]
