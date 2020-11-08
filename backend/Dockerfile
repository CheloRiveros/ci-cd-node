FROM node:14-alpine

RUN mkdir backend && chown -R node:node /backend
WORKDIR /backend

COPY package.json ./
COPY docker-entrypoint.sh ./

USER node
RUN npm install

EXPOSE 3000

ENTRYPOINT ["sh", "/backend/docker-entrypoint.sh"]