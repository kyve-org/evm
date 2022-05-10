FROM node:current-alpine

COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]
