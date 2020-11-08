FROM node:14-alpine

RUN mkdir /frontend && chown -R node:node /frontend
WORKDIR /frontend

COPY package.json ./
USER node
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]